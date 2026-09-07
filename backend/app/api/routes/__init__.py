from fastapi import APIRouter

from app.api.routes import health, onboarding, push, telegram

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(onboarding.router, prefix="/api")
api_router.include_router(telegram.router, prefix="/api")
api_router.include_router(push.router, prefix="/api")
