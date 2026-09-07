from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timedelta, timezone
from typing import Any
from zoneinfo import ZoneInfo

from sqlalchemy import or_, select

from app.core.config import get_settings
from app.db.models import Session
from app.db.session import session_scope
from app.services.push import send_web_push, vapid_configured
from app.services.reminder_copy import REMINDERS, push_payload
from app.services.telegram import (
    STOOL_CHART,
    send_message,
    send_photo,
    stool_url,
    timeline_url,
    url_button,
    with_open_hint,
)

log = logging.getLogger(__name__)

SG = ZoneInfo("Asia/Singapore")
REMINDER_KEYS = ("t72", "t24", "t6")
SENT_ATTR = {
    "t72": "reminder_t72_sent_at",
    "t24": "reminder_t24_sent_at",
    "t6": "reminder_t6_sent_at",
}
HOURS_BEFORE = {"t72": 72, "t24": 24, "t6": 6}


def _report_at(row: Session) -> datetime:
    return datetime.combine(row.procedure_date, row.reporting_time, tzinfo=SG)


def _next_key(row: Session, now: datetime, test: bool) -> str | None:
    for key in REMINDER_KEYS:
        if getattr(row, SENT_ATTR[key]) is not None:
            continue
        if test:
            return key
        if now >= _report_at(row) - timedelta(hours=HOURS_BEFORE[key]):
            return key
        return None
    return None


def _claim_due() -> list[tuple[int | None, dict[str, Any] | None, str, str]]:
    """Pick at most one unsent reminder per linked session. Marks sent before send."""
    settings = get_settings()
    now = datetime.now(timezone.utc)
    claimed: list[tuple[int | None, dict[str, Any] | None, str, str]] = []
    with session_scope() as db:
        rows = list(
            db.scalars(
                select(Session).where(
                    or_(
                        Session.telegram_chat_id.is_not(None),
                        Session.push_endpoint.is_not(None),
                    )
                )
            )
        )
        for row in rows:
            key = _next_key(row, now, settings.telegram_reminder_test)
            if key is None:
                continue
            if row.telegram_chat_id is None and not row.push_endpoint:
                continue
            setattr(row, SENT_ATTR[key], now)
            subscription = None
            if row.push_endpoint and row.push_p256dh and row.push_auth:
                subscription = {
                    "endpoint": row.push_endpoint,
                    "keys": {"p256dh": row.push_p256dh, "auth": row.push_auth},
                }
            claimed.append((row.telegram_chat_id, subscription, key, row.public_code))
    return claimed


async def _send_telegram(chat_id: int, key: str, code: str) -> None:
    if key == "t6" and STOOL_CHART.is_file():
        url = stool_url(code)
        await send_photo(
            chat_id,
            STOOL_CHART,
            with_open_hint(REMINDERS[key], "Open stool guide", url),
            button=url_button("Open stool guide", url),
        )
        return
    url = timeline_url(code)
    await send_message(
        chat_id,
        with_open_hint(REMINDERS[key], "Open timeline", url),
        button=url_button("Open timeline", url),
    )


async def _send_push(subscription: dict[str, Any], key: str, code: str) -> None:
    url = stool_url(code) if key == "t6" else timeline_url(code)
    await asyncio.to_thread(send_web_push, subscription, push_payload(key, url))


async def run_reminder_tick() -> int:
    claimed = await asyncio.to_thread(_claim_due)
    sent = 0
    for chat_id, subscription, key, code in claimed:
        delivered = False
        if chat_id is not None:
            try:
                await _send_telegram(chat_id, key, code)
                delivered = True
            except Exception:
                log.exception("Failed sending %s Telegram reminder for session %s", key, code)
        if subscription is not None:
            try:
                await _send_push(subscription, key, code)
                delivered = True
            except Exception:
                log.exception("Failed sending %s push reminder for session %s", key, code)
        if delivered:
            sent += 1
            log.info("Sent %s reminder for session %s", key, code)
    return sent


def _reminders_enabled() -> bool:
    settings = get_settings()
    return bool(settings.telegram_bot_token.strip() or vapid_configured())


async def run_reminder_loop(stop: asyncio.Event) -> None:
    if not _reminders_enabled():
        return
    log.info(
        "Reminder loop every 60s (%s)",
        "test: 3 messages, one per minute" if get_settings().telegram_reminder_test else "live T−72/24/6",
    )
    while not stop.is_set():
        try:
            await asyncio.wait_for(stop.wait(), timeout=60)
            return
        except asyncio.TimeoutError:
            pass
        try:
            await run_reminder_tick()
        except asyncio.CancelledError:
            raise
        except Exception:
            log.exception("Reminder tick failed")
