from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import or_, select
from sqlalchemy.exc import DBAPIError

from app.core.config import get_settings
from app.db.models import Session
from app.db.session import reset_engine, session_scope
from app.services.push import send_web_push, vapid_configured
from app.services.reminder_copy import payload_from_event
from app.services.reminder_schedule import (
    late_notice_html,
    late_notice_push,
    mark_event_sent,
    next_unsent_event,
    skip_late_events,
    unmark_event_sent,
    upcoming_event,
)
from app.services.timeline import live_reminder_events_for
from app.services.telegram import (
    app_path,
    send_message,
    with_home_hint,
)

log = logging.getLogger(__name__)

LIVE_TICK_SECONDS = 60


def _subscription_for(row: Session) -> dict[str, Any] | None:
    if not row.push_endpoint or not row.push_p256dh or not row.push_auth:
        return None
    return {
        "endpoint": row.push_endpoint,
        "keys": {"p256dh": row.push_p256dh, "auth": row.push_auth},
    }


Claim = tuple[int | None, dict[str, Any] | None, str, str, str, dict[str, Any], str]


def _events_or_empty(db, row: Session) -> list[dict[str, Any]]:
    """Load reminder times in a savepoint so a bad query cannot undo other sessions' claims."""
    nested = db.begin_nested()
    try:
        events = live_reminder_events_for(db, row)
        nested.commit()
        return events
    except Exception:
        nested.rollback()
        log.exception("Reminder event lookup failed for session %s", row.public_code)
        return []


def _claim_due() -> list[Claim]:
    """Telegram keeps its own receipt. In-app push retries on a separate cursor."""
    now = datetime.now(timezone.utc)
    claimed: list[Claim] = []
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
            try:
                if row.telegram_chat_id is None and not row.push_endpoint:
                    continue
                extra: dict[str, Any] = {}
                events = _events_or_empty(db, row)
                subscription = _subscription_for(row)
                skipped = skip_late_events(row, now, events)
                if skipped and row.reminder_late_notice_sent_at is None:
                    row.reminder_late_notice_sent_at = now
                    extra = {"skipped": skipped, "next": next_unsent_event(row, events)}
                    claimed.append(
                        (row.telegram_chat_id, subscription, "late", "late", row.public_code, extra, "both")
                    )
                    continue
                event = upcoming_event(row, now, events)
                if event is None:
                    continue
                mark_event_sent(row, str(event["key"]))
                extra = {"event": event}
                claimed.append(
                    (
                        row.telegram_chat_id,
                        subscription,
                        str(event.get("copy_key") or "step"),
                        str(event["key"]),
                        row.public_code,
                        extra,
                        "both",
                    )
                )
            except Exception:
                log.exception("Skipped reminder claim for session %s", row.public_code)
    return claimed


def _event_from(extra: dict[str, Any]) -> dict[str, Any] | None:
    event = extra.get("event")
    return event if isinstance(event, dict) else None


def _go_for(extra: dict[str, Any], copy_key: str) -> str:
    event = _event_from(extra)
    if event and event.get("go"):
        return str(event["go"])
    return "stool" if copy_key == "stool" else "timeline"


async def _send_telegram(
    chat_id: int, copy_key: str, claim_key: str, code: str, extra: dict[str, Any]
) -> None:
    if claim_key == "late":
        html = late_notice_html(extra.get("skipped") or [], extra.get("next"))
        await send_message(chat_id, with_home_hint(html))
        return
    event = _event_from(extra)
    if event and event.get("html"):
        await send_message(chat_id, with_home_hint(str(event["html"])))
        return
    raise RuntimeError(f"Missing reminder copy for {claim_key}")


async def _send_push(
    subscription: dict[str, Any],
    copy_key: str,
    claim_key: str,
    code: str,
    extra: dict[str, Any],
) -> bool:
    path = app_path(code, _go_for(extra, copy_key))
    if claim_key == "late":
        payload = late_notice_push(extra.get("skipped") or [], extra.get("next"), path)
        return bool(await asyncio.to_thread(send_web_push, subscription, payload))
    event = _event_from(extra)
    if event:
        payload = payload_from_event(event, path)
        return bool(await asyncio.to_thread(send_web_push, subscription, payload))
    raise RuntimeError(f"Missing reminder copy for {claim_key}")


def _claim_due_resilient() -> list[Claim]:
    try:
        return _claim_due()
    except DBAPIError:
        log.warning("Reminder claim lost the database socket; reconnecting")
        reset_engine()
        return _claim_due()


async def run_reminder_tick() -> int:
    claimed = await asyncio.to_thread(_claim_due_resilient)
    sent = 0
    for chat_id, subscription, copy_key, claim_key, code, extra, channel in claimed:
        delivered = False
        if channel in {"telegram", "both"} and chat_id is not None:
            try:
                await _send_telegram(chat_id, copy_key, claim_key, code, extra)
                delivered = True
            except Exception:
                log.exception("Failed sending %s Telegram reminder for session %s", claim_key, code)
        if channel in {"push", "both"} and subscription is not None:
            try:
                if await _send_push(subscription, copy_key, claim_key, code, extra):
                    delivered = True
                else:
                    log.warning("Push not delivered for %s session %s (expired subscription)", claim_key, code)
            except Exception:
                log.exception("Failed sending %s push reminder for session %s", claim_key, code)
        if delivered:
            sent += 1
            log.warning("Sent %s reminder for session %s", claim_key, code)
        else:
            await asyncio.to_thread(_clear_sent, code, claim_key, extra)
            log.warning("Rolled back %s reminder claim for session %s", claim_key, code)
    return sent


def _clear_sent(code: str, claim_key: str, extra: dict[str, Any] | None = None) -> None:
    with session_scope() as db:
        row = db.scalar(select(Session).where(Session.public_code == code.upper()))
        if row is None:
            return
        if claim_key == "late":
            row.reminder_late_notice_sent_at = None
            return
        unmark_event_sent(row, claim_key)


def _reminders_enabled() -> bool:
    settings = get_settings()
    return bool(settings.telegram_bot_token.strip() or vapid_configured())


async def run_reminder_loop(stop: asyncio.Event) -> None:
    if not _reminders_enabled():
        return
    log.warning("Reminder loop starting (live timeline events)")
    while not stop.is_set():
        try:
            await run_reminder_tick()
        except asyncio.CancelledError:
            raise
        except Exception:
            log.exception("Reminder tick failed")
            reset_engine()
        try:
            await asyncio.wait_for(stop.wait(), timeout=LIVE_TICK_SECONDS)
            return
        except asyncio.TimeoutError:
            pass
