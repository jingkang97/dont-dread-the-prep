import hashlib
import os
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict

PRODUCTION_FRONTEND_ORIGIN = "https://dont-dread-the-prep.vercel.app"
# Production plus Vercel preview URLs for this project (git branches, etc.).
DEFAULT_CORS_ORIGIN_REGEX = (
    r"https://dont-dread-the-prep(?:-[a-z0-9-]+)?\.vercel\.app"
)


def _normalize_origin(origin: str) -> str:
    return origin.strip().rstrip("/")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "PrepPath API"
    debug: bool = False
    cors_origins: str = (
        "http://localhost:5173,"
        "http://127.0.0.1:5173,"
        f"{PRODUCTION_FRONTEND_ORIGIN}"
    )
    # Set to empty on Railway to allow only CORS_ORIGINS (no preview URLs).
    cors_origin_regex: str = DEFAULT_CORS_ORIGIN_REGEX
    # Supabase → Project Settings → Database → Connection string (URI)
    # Prefer "Session mode" pooler (port 5432) for Railway and local uvicorn.
    database_url: str = ""

    # BotFather token. Polls getUpdates locally; HTTPS public API uses a webhook.
    telegram_bot_token: str = ""
    telegram_webhook_secret: str = ""
    # True: demo ladder after link — T−72 / T−24 / Picoprep 1–4 / T−6 one minute apart, then 3 hourly, 3 daily.
    # Keep false for live T−72 / T−24 / T−6 from the appointment time.
    telegram_reminder_test: bool = False
    # Local getUpdates. Deletes this bot's webhook — leave false when Railway owns it.
    telegram_poll: bool = False
    # Patient site origin. Empty → localhost when DEBUG, else Vercel.
    site_url: str = ""
    # Public API origin for setWebhook. Empty → https://$RAILWAY_PUBLIC_DOMAIN.
    public_api_url: str = ""

    # Web Push (PWA). Public key is served to the browser; keep the private key secret.
    vapid_public_key: str = ""
    vapid_private_key: str = ""
    vapid_mailto: str = "mailto:preppath@localhost"

    @property
    def cors_origin_list(self) -> list[str]:
        seen: set[str] = set()
        origins: list[str] = []
        for raw in (*self.cors_origins.split(","), PRODUCTION_FRONTEND_ORIGIN):
            origin = _normalize_origin(raw)
            if origin and origin not in seen:
                seen.add(origin)
                origins.append(origin)
        return origins

    @property
    def cors_origin_regex_or_none(self) -> str | None:
        pattern = self.cors_origin_regex.strip()
        return pattern or None

    @property
    def resolved_site_url(self) -> str:
        raw = _normalize_origin(self.site_url)
        if raw:
            return raw
        return "http://localhost:5173" if self.debug else PRODUCTION_FRONTEND_ORIGIN

    @property
    def resolved_public_api_url(self) -> str:
        raw = _normalize_origin(self.public_api_url)
        if raw:
            return raw
        domain = os.environ.get("RAILWAY_PUBLIC_DOMAIN", "").strip()
        if not domain:
            return ""
        if domain.startswith("http://") or domain.startswith("https://"):
            return _normalize_origin(domain)
        return f"https://{domain.rstrip('/')}"

    @property
    def resolved_webhook_secret(self) -> str:
        configured = self.telegram_webhook_secret.strip()
        if configured:
            return configured
        token = self.telegram_bot_token.strip()
        if not token:
            return ""
        return hashlib.sha256(f"preppath-tg:{token}".encode()).hexdigest()

    @property
    def sqlalchemy_database_url(self) -> str:
        """Normalize postgres URLs for SQLAlchemy + psycopg3."""
        url = self.database_url.strip()
        if not url:
            return url
        if url.startswith("postgres://"):
            url = "postgresql://" + url[len("postgres://") :]
        if url.startswith("postgresql://") and "+psycopg" not in url:
            url = "postgresql+psycopg://" + url[len("postgresql://") :]
        return url


@lru_cache
def get_settings() -> Settings:
    return Settings()
