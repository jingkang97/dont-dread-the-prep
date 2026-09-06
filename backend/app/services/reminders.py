from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from sqlalchemy import select

from app.core.config import get_settings
from app.db.models import Session
from app.db.session import session_scope
from app.services.telegram import (
    REMINDERS,
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


def _claim_due() -> list[tuple[int, str, str]]:
    """Pick at most one unsent reminder per linked session. Marks sent before send."""
    settings = get_settings()
    now = datetime.now(timezone.utc)
    claimed: list[tuple[int, str, str]] = []
    with session_scope() as db:
        rows = list(
            db.scalars(select(Session).where(Session.telegram_chat_id.is_not(None)))
        )
        for row in rows:
            key = _next_key(row, now, settings.telegram_reminder_test)
            if key is None or row.telegram_chat_id is None:
                continue
            setattr(row, SENT_ATTR[key], now)
            claimed.append((row.telegram_chat_id, key, row.public_code))
    return claimed


async def run_reminder_tick() -> int:
    claimed = await asyncio.to_thread(_claim_due)
    sent = 0
    for chat_id, key, code in claimed:
        try:
            if key == "t6" and STOOL_CHART.is_file():
                url = stool_url(code)
                await send_photo(
                    chat_id,
                    STOOL_CHART,
                    with_open_hint(REMINDERS[key], "Open stool guide", url),
                    button=url_button("Open stool guide", url),
                )
            else:
                url = timeline_url(code)
                await send_message(
                    chat_id,
                    with_open_hint(REMINDERS[key], "Open timeline", url),
                    button=url_button("Open timeline", url),
                )
            sent += 1
            log.info("Sent %s reminder for session %s", key, code)
        except Exception:
            log.exception("Failed sending %s reminder for session %s", key, code)
    return sent


async def run_reminder_loop(stop: asyncio.Event) -> None:
    if not get_settings().telegram_bot_token.strip():
        return
    log.info(
        "Telegram reminder loop every 60s (%s)",
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
