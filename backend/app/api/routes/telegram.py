from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Header, HTTPException, status

from app.core.config import get_settings
from app.services.telegram import handle_update, unlink_telegram

router = APIRouter(tags=["telegram"])


@router.post("/telegram/webhook")
async def telegram_webhook(
    update: dict[str, Any],
    x_telegram_bot_api_secret_token: str | None = Header(default=None),
) -> dict[str, bool]:
    secret = get_settings().resolved_webhook_secret
    if secret and x_telegram_bot_api_secret_token != secret:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bad webhook secret")
    await handle_update(update)
    return {"ok": True}


@router.delete("/sessions/{public_code}/telegram", status_code=204)
def unlink_session_telegram(public_code: str) -> None:
    if not unlink_telegram(public_code):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
