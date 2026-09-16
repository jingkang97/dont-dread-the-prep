from __future__ import annotations

import logging

from sqlalchemy import func, select
from sqlalchemy.orm import Session as DbSession

from app.core.config import get_settings
from app.db.models import Dish, Ingredient
from app.schemas.food import (
    DishChoice,
    DishOut,
    FoodChatRequest,
    FoodChatResponse,
    FoodChatStatus,
    FoodSource,
    IngredientOut,
    MealPrepOut,
    MealType,
)
from app.services import food_llm

log = logging.getLogger(__name__)

# Session hospital_code -> food source tier. Hospitals sharing a printed sheet
# map to the same tier (nccs procedures follow the SGH/NCCS yellow form).
# Anything not listed here has no hospital-specific tier — chat/meal-prep
# lookups fall straight through to the DIETICIAN baseline.
HOSPITAL_SOURCE_MAP: dict[str, str] = {
    "sgh": "SGH",
    "nccs": "SGH",
    "ttsh": "TTSH",
    "cgh": "CGH",
}


def hospital_source(hospital_code: str) -> str | None:
    return HOSPITAL_SOURCE_MAP.get(hospital_code.strip().lower())


POSSIBLE_MIN_INGREDIENTS = 3


def _dish_verdict(ingredients: list[Ingredient]) -> tuple[str, list[str]]:
    """Verdict + the ingredients to drop when the verdict is 'possible'.

    Priority stays cannot > review > can, same as before. The one addition:
    a dish that would be 'cannot' is downgraded to 'possible' when it has at
    least 3 ingredients and the 'can' ones outnumber the 'cannot' ones — e.g.
    "Teochew steamed fish with rice" is fine minus the achar garnish.
    """
    if not ingredients:
        return "review", []

    cannot = [i for i in ingredients if i.classification == "cannot"]
    if cannot:
        can_count = sum(1 for i in ingredients if i.classification == "can")
        if len(ingredients) >= POSSIBLE_MIN_INGREDIENTS and can_count > len(cannot):
            return "possible", [i.name for i in cannot]
        return "cannot", []

    if any(i.classification == "review" for i in ingredients):
        return "review", []

    return "can", []


def _resolve_ingredients(db: DbSession, dish: Dish) -> list[Ingredient]:
    ids = [item["id"] for item in dish.ingredient_list if isinstance(item, dict) and "id" in item]
    if not ids:
        return []
    rows = {row.id: row for row in db.scalars(select(Ingredient).where(Ingredient.id.in_(ids)))}
    return [rows[i] for i in ids if i in rows]


def _dish_out(db: DbSession, dish: Dish) -> DishOut:
    ingredients = _resolve_ingredients(db, dish)
    verdict, remove_ingredients = _dish_verdict(ingredients)
    return DishOut(
        id=dish.id,
        name=dish.name,
        meal_type=[MealType(m) for m in dish.meal_type],
        source_hospital=FoodSource(dish.source_hospital),
        verdict=verdict,
        remove_ingredients=remove_ingredients,
        ingredients=[IngredientOut.model_validate(i) for i in ingredients],
    )


def list_meal_prep(db: DbSession, hospital_code: str) -> MealPrepOut:
    """Recommended dishes per meal-type category: hospital sheet first, DIETICIAN fills gaps.

    Only dishes where every ingredient classifies as 'can' are recommended.
    """
    source = hospital_source(hospital_code)
    sources = [s for s in (source, "DIETICIAN") if s]

    out = MealPrepOut()
    buckets = {
        "breakfast": out.breakfast,
        "lunch": out.lunch,
        "dinner": out.dinner,
        "snack": out.snacks,
        "drink": out.drinks,
    }
    for meal_type, bucket in buckets.items():
        rows = db.scalars(
            select(Dish)
            .where(Dish.meal_type.contains([meal_type]))
            .where(Dish.source_hospital.in_(sources))
            .order_by(Dish.name)
        ).all()

        by_name: dict[str, Dish] = {}
        for row in rows:
            key = row.name.strip().lower()
            existing = by_name.get(key)
            if existing is None or (existing.source_hospital == "DIETICIAN" and row.source_hospital == source):
                by_name[key] = row

        for row in by_name.values():
            dish_out = _dish_out(db, row)
            if dish_out.verdict == "can":
                bucket.append(dish_out)
        bucket.sort(key=lambda d: d.name)

    return out


FUZZY_MATCH_THRESHOLD = 0.3
CHOICE_GAP_THRESHOLD = 0.08
MAX_CHOICES = 4


def find_dish(db: DbSession, name: str, hospital_code: str) -> tuple[Dish, str] | None:
    """Exact (case-insensitive) name match. Hospital sheet takes priority over DIETICIAN."""
    source = hospital_source(hospital_code)
    for candidate_source in (s for s in (source, "DIETICIAN") if s):
        row = db.scalar(
            select(Dish).where(
                func.lower(Dish.name) == name.strip().lower(),
                Dish.source_hospital == candidate_source,
            )
        )
        if row is not None:
            return row, candidate_source
    return None


def find_dish_candidates(
    db: DbSession, names: list[str], hospital_code: str, limit: int = MAX_CHOICES
) -> list[tuple[Dish, str, float]]:
    """Fuzzy (pg_trgm) matches across every candidate name string.

    Deduped by dish name — a hospital-tier row wins over a same-named
    DIETICIAN row, same priority rule as find_dish — and ranked by best
    similarity score across all the candidate strings, descending.
    """
    source = hospital_source(hospital_code)
    sources = [s for s in (source, "DIETICIAN") if s]
    best_by_name: dict[str, tuple[Dish, str, float]] = {}

    for term in names:
        term = term.strip()
        if not term:
            continue
        for candidate_source in sources:
            similarity = func.similarity(Dish.name, term)
            rows = db.execute(
                select(Dish, similarity)
                .where(Dish.source_hospital == candidate_source, similarity >= FUZZY_MATCH_THRESHOLD)
                .order_by(similarity.desc())
                .limit(limit)
            ).all()
            for dish, sim in rows:
                key = dish.name.strip().lower()
                existing = best_by_name.get(key)
                if existing is None or sim > existing[2]:
                    best_by_name[key] = (dish, candidate_source, float(sim))

    ranked = sorted(best_by_name.values(), key=lambda row: row[2], reverse=True)
    return ranked[:limit]


def get_dish(db: DbSession, dish_id: int) -> DishOut | None:
    dish = db.get(Dish, dish_id)
    if dish is None:
        return None
    return _dish_out(db, dish)


def answer_chat(db: DbSession, body: FoodChatRequest) -> FoodChatResponse:
    settings = get_settings()
    if not settings.food_chat_configured:
        return FoodChatResponse(
            status=FoodChatStatus.not_configured,
            message="Food chat is not configured yet. Set GOOGLE_API_URL / GOOGLE_API_KEY / GOOGLE_MODEL.",
        )

    try:
        result = food_llm.identify_food_query(body.query)
    except Exception:
        log.exception("food_llm.identify_food_query failed")
        return FoodChatResponse(
            status=FoodChatStatus.not_configured,
            message="Could not reach the food model. Try again shortly.",
        )

    if result.status == "irrelevant":
        return FoodChatResponse(
            status=FoodChatStatus.irrelevant,
            message=result.message or "That doesn't look like a food or drink question.",
        )
    if result.status == "multiple":
        return FoodChatResponse(
            status=FoodChatStatus.multiple,
            message=result.message or "I can only look up one food at a time — ask about one item.",
        )

    candidate_terms = result.synonyms or [body.query]

    for synonym in candidate_terms:
        found = find_dish(db, synonym, body.hospital_code)
        if found is not None:
            dish, source = found
            return FoodChatResponse(
                status=FoodChatStatus.ok,
                matched_query=synonym,
                matched_source=FoodSource(source),
                dish=_dish_out(db, dish),
            )

    candidates = find_dish_candidates(db, candidate_terms, body.hospital_code)
    if not candidates:
        return FoodChatResponse(
            status=FoodChatStatus.not_found,
            message=result.message or f"I don't have '{body.query.strip()}' in the ruleset yet.",
        )

    top_dish, top_source, top_score = candidates[0]
    runner_up_score = candidates[1][2] if len(candidates) > 1 else 0.0
    if len(candidates) == 1 or (top_score - runner_up_score) >= CHOICE_GAP_THRESHOLD:
        return FoodChatResponse(
            status=FoodChatStatus.ok,
            matched_query=top_dish.name,
            matched_source=FoodSource(top_source),
            dish=_dish_out(db, top_dish),
        )

    return FoodChatResponse(
        status=FoodChatStatus.choices,
        message="I found a few dishes that might match — which one did you mean?",
        choices=[DishChoice(id=dish.id, name=dish.name) for dish, _source, _score in candidates],
    )
