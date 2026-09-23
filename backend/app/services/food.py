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

# Session hospital_code -> food source tier. Only the hospitals whose own sheet
# is loaded into ingredient_tab/dishes_tab appear here. Anything not listed —
# sgh, nccs, cgh — has no hospital-specific tier, so chat/meal-prep lookups fall
# straight through to the DIETICIAN baseline.
HOSPITAL_SOURCE_MAP: dict[str, str] = {
    "skh": "SKH",
    "ttsh": "TTSH",
}


def hospital_source(hospital_code: str) -> str | None:
    return HOSPITAL_SOURCE_MAP.get(hospital_code.strip().lower())


def _dish_verdict(
    ingredients: list[Ingredient],
    hard_no: bool = False,
    unresolved: list[str] | None = None,
) -> tuple[str, list[str]]:
    """Verdict + the ingredients to leave out when the verdict is 'possible'.

    A dish flagged hard_no is 'cannot' whatever its ingredients say. The refusal
    is about how the dish is cooked — deep-fried, oil-heavy — which no ingredient
    row can express: every ingredient in fried chicken classifies as 'can' on its
    own, so the computed verdict came out 'can' and meal-prep recommended it.
    Nothing is offered to leave out, because leaving something out does not make
    the dish acceptable.

    Ingredients are read as two-state: 'can' is a yes, and both 'cannot' and
    'review' are a no — an item the sheet has not cleared is one to leave out,
    not one to assume. Every ingredient yes makes the dish 'can'; more yes than
    no makes it 'possible', naming the no ingredients to leave out (e.g.
    "Teochew steamed fish with rice" minus the achar garnish); otherwise the
    dish is 'cannot'.

    `unresolved` carries the ingredients the sheet no longer classifies at all
    (see _resolve_ingredients). They count as a no on the same reasoning: an
    unclassified ingredient is not a cleared one. Without this, a dish was
    judged on the subset that happened to resolve — "Kaya toast" came out 'can'
    on white bread alone, its butter dropped on the floor.

    More yes than no requires at least two yes against one no, so 'possible'
    already implies 3+ ingredients — the old explicit floor is now redundant.
    """
    if hard_no:
        return "cannot", []

    unresolved = unresolved or []
    if not ingredients and not unresolved:
        return "review", []

    leave_out = [i.name for i in ingredients if i.classification != "can"] + unresolved
    if not leave_out:
        return "can", []

    total = len(ingredients) + len(unresolved)
    if total - len(leave_out) > len(leave_out):
        return "possible", leave_out

    return "cannot", []


def _resolve_ingredients(db: DbSession, dish: Dish) -> tuple[list[Ingredient], list[str]]:
    """Ingredient rows for a dish, plus the names that no longer resolve.

    ingredient_list holds the ids the sheet carried when the seed was written.
    An ingredient the sheet has since dropped is stored as {"id": null, "name":
    "..."}, and an id can also go missing when the sheet is reloaded. Those
    names come back in the second list rather than being skipped, so the verdict
    can count them — the dish card has no row to show for them.
    """
    entries = [item for item in dish.ingredient_list if isinstance(item, dict)]
    ids = [item["id"] for item in entries if item.get("id") is not None]
    rows = (
        {row.id: row for row in db.scalars(select(Ingredient).where(Ingredient.id.in_(ids)))}
        if ids
        else {}
    )

    resolved: list[Ingredient] = []
    unresolved: list[str] = []
    for item in entries:
        row = rows.get(item["id"]) if item.get("id") is not None else None
        if row is not None:
            resolved.append(row)
        elif str(item.get("name") or "").strip():
            unresolved.append(str(item["name"]).strip())
    return resolved, unresolved


def _dish_out(db: DbSession, dish: Dish) -> DishOut:
    ingredients, unresolved = _resolve_ingredients(db, dish)
    verdict, remove_ingredients = _dish_verdict(ingredients, dish.hard_no, unresolved)
    return DishOut(
        id=dish.id,
        name=dish.name,
        meal_type=[MealType(m) for m in dish.meal_type],
        source_hospital=FoodSource(dish.source_hospital),
        verdict=verdict,
        remove_ingredients=remove_ingredients,
        hard_no=dish.hard_no,
        hard_no_reason=dish.hard_no_reason,
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


def find_dish_family(db: DbSession, dish: Dish, source: str) -> list[Dish]:
    """Sibling dishes that hang a qualifier off this one's name with a hyphen.

    'Kopi' has 'Kopi-C' and 'Kopi-O' this way, and 'Teh' has 'Teh-C'/'Teh-O' —
    the kopitiam convention for "same drink, different milk/sugar". A plain
    'kopi' query landing on the base dish is exactly as ambiguous as landing on
    none of them, so it should prompt a choice the same way an unresolved fuzzy
    match does, not silently assume the plain version.

    Deliberately hyphen-only, not a general name-prefix match: DIETICIAN dishes
    like 'Beef' ('Beef noodles', 'Beef hor fun') or 'Onion' ('Onion prata')
    share a leading word with unrelated composite dishes, and forcing a choice
    there would be noise, not help — the hyphen is what marks "variant of the
    same drink" rather than "different dish that happens to start the same".
    """
    return db.scalars(
        select(Dish)
        .where(
            Dish.source_hospital == source,
            Dish.id != dish.id,
            Dish.name.ilike(f"{dish.name}-%"),
        )
        .order_by(Dish.name)
    ).all()


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

    # The user's own wording goes first: it's what they actually typed (e.g.
    # "kopi", itself an exact dish name), and should win an exact match over
    # an LLM synonym ("black coffee") that also happens to resolve — the
    # model is asked for English alternate spellings, not ranked by fit, so
    # its ordering can't be trusted to put the best match first.
    candidate_terms = list(dict.fromkeys([body.query, *result.synonyms]))

    for synonym in candidate_terms:
        found = find_dish(db, synonym, body.hospital_code)
        if found is not None:
            dish, source = found
            siblings = find_dish_family(db, dish, source)
            if siblings:
                choices = sorted([dish, *siblings], key=lambda d: d.name)[:MAX_CHOICES]
                return FoodChatResponse(
                    status=FoodChatStatus.choices,
                    message="I found a few dishes that might match — which one did you mean?",
                    choices=[DishChoice(id=d.id, name=d.name) for d in choices],
                )
            return FoodChatResponse(
                status=FoodChatStatus.ok,
                matched_query=synonym,
                matched_source=FoodSource(source),
                dish=_dish_out(db, dish),
            )

    candidates = find_dish_candidates(db, candidate_terms, body.hospital_code)
    if not candidates:
        # result.message is only ever meaningful for 'irrelevant'/'multiple' —
        # the prompt gives the model nothing to say for 'ok', which is the only
        # status left once we're here, so it fills the field with something
        # like "Synonyms for coke zero". Always use the fixed line instead.
        return FoodChatResponse(
            status=FoodChatStatus.not_found,
            message=f"I don't have '{body.query.strip()}' in the ruleset yet.",
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
