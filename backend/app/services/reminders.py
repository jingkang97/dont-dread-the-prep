from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy import or_, select
from sqlalchemy.exc import DBAPIError

from app.core.config import get_settings
from app.db.models import Session
from app.db.session import reset_engine, session_scope
from app.services.push import send_web_push, vapid_configured
from app.services.reminder_copy import REMINDERS, dose_html, dose_push_payload, push_payload
from app.services.reminder_schedule import (
    SENT_ATTR,
    demo_fast_tick_span,
    demo_html,
    demo_mode,
    demo_push_payload,
    demo_steps_for,
    late_notice_html,
    late_notice_push,
    mark_dose_sent,
    skip_late_doses,
    skip_late_windows,
    unmark_dose_sent,
    start_demo_clock,
    upcoming_dose,
    upcoming_live,
)
from app.services.timeline import dose_reminders_for
from app.services.telegram import (
    app_path,
    send_message,
    with_home_hint,
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


def _peek_demo_step(
    row: Session, now: datetime, sent: int, doses: list[dict[str, Any]]
) -> dict[str, Any] | None:
    if row.reminder_anchor_at is None:
        start_demo_clock(row, restart=True)
    sent = max(0, int(sent or 0))
    steps = demo_steps_for(doses)
    if sent >= len(steps):
        return None
    step = steps[sent]
    due = _as_utc(row.reminder_anchor_at) + step["delay"]
    if _as_utc(now) < due:
        return None
    return step


def _subscription_for(row: Session) -> dict[str, Any] | None:
    if not row.push_endpoint or not row.push_p256dh or not row.push_auth:
        return None
    return {
        "endpoint": row.push_endpoint,
        "keys": {"p256dh": row.push_p256dh, "auth": row.push_auth},
    }


Claim = tuple[int | None, dict[str, Any] | None, str, str, str, dict[str, Any], str]


def _doses_or_empty(db, row: Session, now: datetime) -> list[dict[str, Any]]:
    """Load dose times in a savepoint so a bad query cannot undo other sessions' claims."""
    nested = db.begin_nested()
    try:
        doses = dose_reminders_for(db, row)
        skip_late_doses(row, now, doses)
        nested.commit()
        return doses
    except Exception:
        nested.rollback()
        log.exception("Dose lookup failed for session %s; checkpoints still run", row.public_code)
        return []


def _claim_due() -> list[Claim]:
    """Telegram keeps its own receipt. In-app push retries on a separate cursor."""
    now = datetime.now(timezone.utc)
    demo = demo_mode()
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
                doses = _doses_or_empty(db, row, now)
                subscription = _subscription_for(row)
                if demo:
                    demo_index = max(0, int(row.reminder_demo_sent or 0))
                    step = _peek_demo_step(row, now, demo_index, doses)
                    if step is not None:
                        row.reminder_demo_sent = demo_index + 1
                        extra = {"demo_step": step, "demo_index": demo_index}
                        claimed.append(
                            (
                                row.telegram_chat_id,
                                subscription,
                                step["copy"],
                                step["key"],
                                row.public_code,
                                extra,
                                "both",
                            )
                        )
                    continue
                skipped = skip_late_windows(row, now)
                if skipped and row.reminder_late_notice_sent_at is None:
                    row.reminder_late_notice_sent_at = now
                    extra = {"skipped": skipped, "next": upcoming_live(row, now)}
                    claimed.append(
                        (row.telegram_chat_id, subscription, "late", "late", row.public_code, extra, "both")
                    )
                    continue
                copy_key = _next_live_key(row, now)
                if copy_key is not None:
                    setattr(row, SENT_ATTR[copy_key], now)
                    claimed.append(
                        (
                            row.telegram_chat_id,
                            subscription,
                            copy_key,
                            copy_key,
                            row.public_code,
                            {},
                            "both",
                        )
                    )
                    continue
                dose = upcoming_dose(row, now, doses)
                if dose is None:
                    continue
                mark_dose_sent(row, str(dose["key"]))
                extra = {"dose_title": dose["title"], "dose_agent": dose.get("agent") or "picoprep"}
                claimed.append(
                    (
                        row.telegram_chat_id,
                        subscription,
                        "peg" if dose.get("agent") == "peg" else "dose",
                        f"dose:{dose['key']}",
                        row.public_code,
                        extra,
                        "both",
                    )
                )
            except Exception:
                log.exception("Skipped reminder claim for session %s", row.public_code)
    return claimed


def _demo_step_from(extra: dict[str, Any]) -> dict[str, Any] | None:
    step = extra.get("demo_step")
    return step if isinstance(step, dict) else None


async def _send_telegram(
    chat_id: int, copy_key: str, claim_key: str, code: str, extra: dict[str, Any]
) -> None:
    if claim_key == "late":
        html = late_notice_html(extra.get("skipped") or [], extra.get("next"))
        await send_message(chat_id, with_home_hint(html))
        return
    if claim_key.startswith("dose:"):
        html = dose_html(str(extra.get("dose_title") or "Prep dose"), str(extra.get("dose_agent") or "picoprep"))
        await send_message(chat_id, with_home_hint(html))
        return
    step = _demo_step_from(extra)
    html = demo_html(step) if step else REMINDERS[copy_key]
    await send_message(chat_id, with_home_hint(html))


async def _send_push(
    subscription: dict[str, Any],
    copy_key: str,
    claim_key: str,
    code: str,
    extra: dict[str, Any],
) -> bool:
    path = app_path(code, "stool" if copy_key == "t6" else "timeline")
    if claim_key == "late":
        payload = late_notice_push(extra.get("skipped") or [], extra.get("next"), path)
        return bool(await asyncio.to_thread(send_web_push, subscription, payload))
    if claim_key.startswith("dose:"):
        payload = dose_push_payload(
            str(extra.get("dose_title") or "Prep dose"),
            str(extra.get("dose_agent") or "picoprep"),
            path,
        )
        return bool(await asyncio.to_thread(send_web_push, subscription, payload))
    step = _demo_step_from(extra)
    payload = demo_push_payload(step, path) if step else push_payload(copy_key, path)
    return bool(await asyncio.to_thread(send_web_push, subscription, payload))


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
        if claim_key in SENT_ATTR:
            setattr(row, SENT_ATTR[claim_key], None)
            return
        if claim_key.startswith("dose:"):
            unmark_dose_sent(row, claim_key.removeprefix("dose:"))
            return
        idx = extra.get("demo_index") if extra else None
        if idx is None:
            try:
                doses = dose_reminders_for(db, row)
            except Exception:
                doses = []
            idx = next((i for i, step in enumerate(demo_steps_for(doses)) if step["key"] == claim_key), None)
        if idx is None:
            return
        idx = int(idx)
        sent = max(0, int(row.reminder_demo_sent or 0))
        # Only rewind if we are still sitting on this step — another worker may have moved on.
        if sent == idx + 1:
            row.reminder_demo_sent = idx


def _reminders_enabled() -> bool:
    settings = get_settings()
    return bool(settings.telegram_bot_token.strip() or vapid_configured())


async def run_reminder_loop(stop: asyncio.Event) -> None:
    if not _reminders_enabled():
        return
    log.warning(
        "Reminder loop starting (%s)",
        "demo: 72h/24h/prep doses/6h one minute apart, then 3 hourly, then 3 daily"
        if demo_mode()
        else "live T−72/24/6",
    )
    while not stop.is_set():
        try:
            await run_reminder_tick()
        except asyncio.CancelledError:
            raise
        except Exception:
            log.exception("Reminder tick failed")
            reset_engine()
        tick = await asyncio.to_thread(_tick_seconds)
        try:
            await asyncio.wait_for(stop.wait(), timeout=tick)
            return
        except asyncio.TimeoutError:
            pass


def _tick_seconds() -> int:
    if not demo_mode():
        return LIVE_TICK_SECONDS
    now = datetime.now(timezone.utc)
    try:
        with session_scope() as db:
            rows = db.scalars(
                select(Session).where(
                    or_(
                        Session.telegram_chat_id.is_not(None),
                        Session.push_endpoint.is_not(None),
                    )
                )
            )
            for row in rows:
                anchor = row.reminder_anchor_at
                if anchor is None:
                    continue
                try:
                    span = demo_fast_tick_span(dose_reminders_for(db, row))
                except Exception:
                    span = timedelta(minutes=15)
                if _as_utc(now) - _as_utc(anchor) <= span:
                    return DEMO_TICK_SECONDS
    except DBAPIError:
        log.warning("Reminder wait probe lost the database socket; reconnecting")
        reset_engine()
        return DEMO_TICK_SECONDS
    return LIVE_TICK_SECONDS
