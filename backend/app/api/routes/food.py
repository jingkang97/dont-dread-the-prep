from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.food import FoodChatRequest, FoodChatResponse, MealPrepOut
from app.services import food as food_service

router = APIRouter(prefix="/food", tags=["food"])


@router.get("/meal-prep", response_model=MealPrepOut)
def get_meal_prep(hospital_code: str, db: Session = Depends(get_db)) -> MealPrepOut:
    """Breakfast/lunch/dinner dishes for this hospital where every ingredient is safe to eat."""
    return food_service.list_meal_prep(db, hospital_code)


@router.post("/chat", response_model=FoodChatResponse)
def post_food_chat(body: FoodChatRequest, db: Session = Depends(get_db)) -> FoodChatResponse:
    """Free-text food question → LLM food identification → dish_tab lookup."""
    return food_service.answer_chat(db, body)
