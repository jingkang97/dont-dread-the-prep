from __future__ import annotations

from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class FoodClassification(str, Enum):
    can = "can"
    cannot = "cannot"
    review = "review"


class DishVerdict(str, Enum):
    can = "can"
    cannot = "cannot"
    review = "review"
    possible = "possible"


class FoodSource(str, Enum):
    """Matches DB food_source enum: the tiers a sheet is loaded for.

    A hospital without its own sheet (sgh, nccs, cgh) is served the DIETICIAN
    baseline instead of carrying a tier of its own.
    """

    skh = "SKH"
    ttsh = "TTSH"
    dietician = "DIETICIAN"


class MealType(str, Enum):
    breakfast = "breakfast"
    lunch = "lunch"
    dinner = "dinner"
    snack = "snack"
    drink = "drink"


class IngredientOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    classification: FoodClassification
    classification_reason: str
    source_hospital: FoodSource
    source_document: str


class DishOut(BaseModel):
    id: int
    name: str
    meal_type: list[MealType]
    source_hospital: FoodSource
    verdict: DishVerdict
    # Ingredients to leave out when verdict == 'possible'.
    remove_ingredients: list[str] = Field(default_factory=list)
    # Refused on how the dish is cooked rather than on its ingredients; forces
    # verdict == 'cannot'. hard_no_reason carries the line to show for it.
    hard_no: bool = False
    hard_no_reason: str = ""
    ingredients: list[IngredientOut] = Field(default_factory=list)


class MealPrepOut(BaseModel):
    breakfast: list[DishOut] = Field(default_factory=list)
    lunch: list[DishOut] = Field(default_factory=list)
    dinner: list[DishOut] = Field(default_factory=list)
    snacks: list[DishOut] = Field(default_factory=list)
    drinks: list[DishOut] = Field(default_factory=list)


class FoodChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=200)
    hospital_code: str = Field(..., examples=["ttsh", "skh"])


class FoodChatStatus(str, Enum):
    ok = "ok"
    multiple = "multiple"
    irrelevant = "irrelevant"
    not_found = "not_found"
    not_configured = "not_configured"
    choices = "choices"


class DishChoice(BaseModel):
    id: int
    name: str


class FoodChatResponse(BaseModel):
    status: FoodChatStatus
    message: Optional[str] = None
    matched_query: Optional[str] = None
    matched_source: Optional[FoodSource] = None
    dish: Optional[DishOut] = None
    choices: Optional[list[DishChoice]] = None
