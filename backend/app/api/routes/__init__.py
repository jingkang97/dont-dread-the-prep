from fastapi import APIRouter

from app.api.routes import health, onboarding

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(onboarding.router, prefix="/api")
