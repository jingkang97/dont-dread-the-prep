import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import OperationalError

from app.api.routes import api_router
from app.core.config import get_settings
from app.db.session import reset_engine
from app.services.push import vapid_configured
from app.services.reminders import run_reminder_loop
from app.services.telegram import start_telegram_listener

log = logging.getLogger(__name__)
settings = get_settings()
docs_enabled = settings.debug


@asynccontextmanager
async def lifespan(_app: FastAPI):
    stop = asyncio.Event()
    tasks: list[asyncio.Task] = []
    token = bool(settings.telegram_bot_token.strip())
    public_https = settings.resolved_public_api_url.startswith("https://")
    if token and (settings.telegram_poll or public_https):
        tasks.append(asyncio.create_task(start_telegram_listener(stop), name="telegram-listener"))
    if settings.should_send_reminders and (token or vapid_configured()):
        tasks.append(asyncio.create_task(run_reminder_loop(stop), name="telegram-reminders"))
    log.info(
        "Reminders send=%s telegram=%s push=%s poll=%s site=%s api=%s",
        settings.should_send_reminders,
        token,
        vapid_configured(),
        settings.telegram_poll,
        settings.resolved_site_url,
        settings.resolved_public_api_url or "idle",
    )
    yield
    stop.set()
    for task in tasks:
        task.cancel()
    if tasks:
        await asyncio.gather(*tasks, return_exceptions=True)


app = FastAPI(
    title=settings.app_name,
    debug=docs_enabled,
    docs_url="/docs" if docs_enabled else None,
    redoc_url="/redoc" if docs_enabled else None,
    openapi_url="/openapi.json" if docs_enabled else None,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=settings.cors_origin_regex_or_none,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.exception_handler(OperationalError)
async def database_unavailable(_request: Request, exc: OperationalError) -> JSONResponse:
    log.warning("Database unreachable: %s", exc.__class__.__name__)
    reset_engine()
    return JSONResponse(status_code=503, content={"detail": "database unreachable"})


@app.get("/")
def root() -> dict[str, str]:
    payload = {"message": settings.app_name, "health": "/health"}
    if docs_enabled:
        payload["docs"] = "/docs"
    return payload
