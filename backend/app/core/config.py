from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "PrepPath API"
    debug: bool = True
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    # Supabase → Project Settings → Database → Connection string (URI)
    # Prefer "Session mode" pooler for local uvicorn, or direct connection.
    database_url: str = ""

    # BotFather token. Polls getUpdates locally; set webhook later when public.
    telegram_bot_token: str = ""
    telegram_webhook_secret: str = ""
    # True: send T−72 / T−24 / T−6 one per minute after /start, then stop.
    telegram_reminder_test: bool = True
    site_url: str = "http://localhost:5173"

    # Web Push (PWA). Public key is served to the browser; keep the private key secret.
    vapid_public_key: str = ""
    vapid_private_key: str = ""
    vapid_mailto: str = "mailto:preppath@localhost"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

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
