from fastapi import APIRouter

from app.api.routes import food, health, onboarding, push, telegram, timeline, translations

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(onboarding.router, prefix="/api")
api_router.include_router(telegram.router, prefix="/api")
api_router.include_router(push.router, prefix="/api")
api_router.include_router(timeline.router, prefix="/api")
api_router.include_router(food.router, prefix="/api")
api_router.include_router(translations.router, prefix="/api")
