from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.db.session import check_database

router = APIRouter(tags=["health"])


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/health/db")
def health_db() -> JSONResponse:
    settings = get_settings()
    if not settings.database_url:
        return JSONResponse(
            status_code=503,
            content={
                "status": "error",
                "database": "not_configured",
                "detail": "DATABASE_URL is missing in backend/.env",
            },
        )
    try:
        check_database()
        return JSONResponse(content={"status": "ok", "database": "connected"})
    except Exception as exc:
        return JSONResponse(
            status_code=503,
            content={
                "status": "error",
                "database": "unreachable",
                "detail": str(exc.__class__.__name__),
            },
        )
