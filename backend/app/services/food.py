from __future__ import annotations

import logging

from sqlalchemy import func, select
from sqlalchemy.orm import Session as DbSession

from app.core.config import get_settings
from app.db.models import Dish, Ingredient
from app.schemas.food import (
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


def _ingredient_verdict(ingredients: list[Ingredient]) -> str:
    if not ingredients:
        return "review"
    if any(i.classification == "cannot" for i in ingredients):
        return "cannot"
    if any(i.classification == "review" for i in ingredients):
        return "review"
    return "can"


def _resolve_ingredients(db: DbSession, dish: Dish) -> list[Ingredient]:
    ids = [item["id"] for item in dish.ingredient_list if isinstance(item, dict) and "id" in item]
    if not ids:
        return []
    rows = {row.id: row for row in db.scalars(select(Ingredient).where(Ingredient.id.in_(ids)))}
    return [rows[i] for i in ids if i in rows]


def _dish_out(db: DbSession, dish: Dish) -> DishOut:
    ingredients = _resolve_ingredients(db, dish)
    return DishOut(
        id=dish.id,
        name=dish.name,
        meal_type=MealType(dish.meal_type),
        source_hospital=FoodSource(dish.source_hospital),
        verdict=_ingredient_verdict(ingredients),
        ingredients=[IngredientOut.model_validate(i) for i in ingredients],
    )


def list_meal_prep(db: DbSession, hospital_code: str) -> MealPrepOut:
    """Recommended dishes per meal slot: hospital sheet first, DIETICIAN fills gaps.

    Only dishes where every ingredient classifies as 'can' are recommended.
    """
    source = hospital_source(hospital_code)
    sources = [s for s in (source, "DIETICIAN") if s]

    out = MealPrepOut()
    buckets = {"breakfast": out.breakfast, "lunch": out.lunch, "dinner": out.dinner}
    for meal_type, bucket in buckets.items():
        rows = db.scalars(
            select(Dish)
            .where(Dish.meal_type.in_([meal_type, "any"]))
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

    for synonym in result.synonyms or [body.query]:
        found = find_dish(db, synonym, body.hospital_code)
        if found is not None:
            dish, source = found
            return FoodChatResponse(
                status=FoodChatStatus.ok,
                matched_query=synonym,
                matched_source=FoodSource(source),
                dish=_dish_out(db, dish),
            )

    return FoodChatResponse(
        status=FoodChatStatus.not_found,
        message=result.message or f"I don't have '{body.query.strip()}' in the ruleset yet.",
    )
