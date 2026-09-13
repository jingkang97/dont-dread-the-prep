from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import or_, select
from sqlalchemy.exc import OperationalError

from app.core.config import get_settings
from app.db.models import Session
from app.db.session import reset_engine, session_scope
from app.services.push import send_web_push, vapid_configured
from app.services.reminder_copy import REMINDERS, push_payload
from app.services.reminder_schedule import (
    DEMO_STEPS,
    SENT_ATTR,
    demo_html,
    demo_mode,
    demo_push_payload,
    late_notice_html,
    late_notice_push,
    skip_late_windows,
    start_demo_clock,
    upcoming_live,
)
from app.services.telegram import (
    STOOL_CHART,
    app_path,
    send_message,
    send_photo,
    stool_url,
    timeline_url,
    url_button,
    with_open_hint,
)

log = logging.getLogger(__name__)

DEMO_TICK_SECONDS = 10
LIVE_TICK_SECONDS = 60


def _next_live_key(row: Session, now: datetime) -> str | None:
    nxt = upcoming_live(row, now)
    if nxt is None:
        return None
    key, due = nxt
    if now >= due:
        return key
    return None


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def _next_demo_step(row: Session, now: datetime) -> dict[str, Any] | None:
    if row.reminder_anchor_at is None:
        start_demo_clock(row, restart=True)
    sent = max(0, int(row.reminder_demo_sent or 0))
    if sent >= len(DEMO_STEPS):
        return None
    step = DEMO_STEPS[sent]
    due = _as_utc(row.reminder_anchor_at) + step["delay"]
    if _as_utc(now) < due:
        return None
    row.reminder_demo_sent = sent + 1
    return step


def _claim_due() -> list[tuple[int | None, dict[str, Any] | None, str, str, str, dict[str, Any]]]:
    """Pick at most one unsent reminder per linked session. Marks sent before send."""
    now = datetime.now(timezone.utc)
    demo = demo_mode()
    claimed: list[tuple[int | None, dict[str, Any] | None, str, str, str, dict[str, Any]]] = []
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
            if row.telegram_chat_id is None and not row.push_endpoint:
                continue
            extra: dict[str, Any] = {}
            if demo:
                step = _next_demo_step(row, now)
                if step is None:
                    continue
                claim_key = step["key"]
                copy_key = step["copy"]
            else:
                skipped = skip_late_windows(row, now)
                if skipped and row.reminder_late_notice_sent_at is None:
                    row.reminder_late_notice_sent_at = now
                    copy_key = "late"
                    claim_key = "late"
                    extra = {"skipped": skipped, "next": upcoming_live(row, now)}
                else:
                    copy_key = _next_live_key(row, now)
                    if copy_key is None:
                        continue
                    setattr(row, SENT_ATTR[copy_key], now)
                    claim_key = copy_key
            subscription = None
            if row.push_endpoint and row.push_p256dh and row.push_auth:
                subscription = {
                    "endpoint": row.push_endpoint,
                    "keys": {"p256dh": row.push_p256dh, "auth": row.push_auth},
                }
            claimed.append(
                (row.telegram_chat_id, subscription, copy_key, claim_key, row.public_code, extra)
            )
    return claimed


def _step_for(claim_key: str) -> dict[str, Any] | None:
    for step in DEMO_STEPS:
        if step["key"] == claim_key:
            return step
    return None


async def _send_telegram(
    chat_id: int, copy_key: str, claim_key: str, code: str, extra: dict[str, Any]
) -> None:
    url = stool_url(code) if copy_key == "t6" else timeline_url(code)
    if claim_key == "late":
        html = late_notice_html(extra.get("skipped") or [], extra.get("next"))
        await send_message(
            chat_id,
            with_open_hint(html, "Open timeline", timeline_url(code)),
            button=url_button("Open timeline", timeline_url(code)),
        )
        return
    step = _step_for(claim_key)
    html = demo_html(step) if step else REMINDERS[copy_key]
    if copy_key == "t6" and STOOL_CHART.is_file():
        await send_photo(
            chat_id,
            STOOL_CHART,
            with_open_hint(html, "Open stool guide", url),
            button=url_button("Open stool guide", url),
        )
        return
    await send_message(
        chat_id,
        with_open_hint(html, "Open timeline", url),
        button=url_button("Open timeline", url),
    )


async def _send_push(
    subscription: dict[str, Any],
    copy_key: str,
    claim_key: str,
    code: str,
    extra: dict[str, Any],
) -> None:
    path = app_path(code, "stool" if copy_key == "t6" else "timeline")
    if claim_key == "late":
        payload = late_notice_push(extra.get("skipped") or [], extra.get("next"), path)
        await asyncio.to_thread(send_web_push, subscription, payload)
        return
    step = _step_for(claim_key)
    payload = demo_push_payload(step, path) if step else push_payload(copy_key, path)
    await asyncio.to_thread(send_web_push, subscription, payload)


def _claim_due_resilient() -> list[tuple[int | None, dict[str, Any] | None, str, str, str, dict[str, Any]]]:
    try:
        return _claim_due()
    except OperationalError:
        log.warning("Reminder claim lost the database socket; reconnecting")
        reset_engine()
        return _claim_due()


async def run_reminder_tick() -> int:
    claimed = await asyncio.to_thread(_claim_due_resilient)
    sent = 0
    for chat_id, subscription, copy_key, claim_key, code, extra in claimed:
        delivered = False
        if chat_id is not None:
            try:
                await _send_telegram(chat_id, copy_key, claim_key, code, extra)
                delivered = True
            except Exception:
                log.exception("Failed sending %s Telegram reminder for session %s", claim_key, code)
        if subscription is not None:
            try:
                await _send_push(subscription, copy_key, claim_key, code, extra)
                delivered = True
            except Exception:
                log.exception("Failed sending %s push reminder for session %s", claim_key, code)
        if delivered:
            sent += 1
            log.info("Sent %s reminder for session %s", claim_key, code)
        else:
            await asyncio.to_thread(_clear_sent, code, claim_key)
            log.warning("Rolled back %s reminder claim for session %s", claim_key, code)
    return sent


def _clear_sent(code: str, claim_key: str) -> None:
    with session_scope() as db:
        row = db.scalar(select(Session).where(Session.public_code == code.upper()))
        if row is None:
            return
        if claim_key == "late":
            row.reminder_late_notice_sent_at = None
            return
        if claim_key in SENT_ATTR:
            setattr(row, SENT_ATTR[claim_key], None)
            return
        sent = max(0, int(row.reminder_demo_sent or 0))
        row.reminder_demo_sent = max(0, sent - 1)


def _reminders_enabled() -> bool:
    settings = get_settings()
    return bool(settings.telegram_bot_token.strip() or vapid_configured())


async def run_reminder_loop(stop: asyncio.Event) -> None:
    if not _reminders_enabled():
        return
    tick = DEMO_TICK_SECONDS if demo_mode() else LIVE_TICK_SECONDS
    log.info(
        "Reminder loop every %ss (%s)",
        tick,
        "demo: now/+1m/+2m, then 3/hour, then 3/day" if demo_mode() else "live T−72/24/6",
    )
    while not stop.is_set():
        try:
            await run_reminder_tick()
        except asyncio.CancelledError:
            raise
        except Exception:
            log.exception("Reminder tick failed")
            reset_engine()
        try:
            await asyncio.wait_for(stop.wait(), timeout=tick)
            return
        except asyncio.TimeoutError:
            pass
