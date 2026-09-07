import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import api_router
from app.core.config import get_settings
from app.services.push import vapid_configured
from app.services.reminders import run_reminder_loop
from app.services.telegram import poll_updates

settings = get_settings()
docs_enabled = settings.debug


@asynccontextmanager
async def lifespan(_app: FastAPI):
    stop = asyncio.Event()
    tasks: list[asyncio.Task] = []
    if settings.telegram_bot_token.strip():
        tasks.append(asyncio.create_task(poll_updates(stop), name="telegram-poll"))
    if settings.telegram_bot_token.strip() or vapid_configured():
        tasks.append(asyncio.create_task(run_reminder_loop(stop), name="telegram-reminders"))
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


@app.get("/")
def root() -> dict[str, str]:
    payload = {"message": settings.app_name, "health": "/health"}
    if docs_enabled:
        payload["docs"] = "/docs"
    return payload
