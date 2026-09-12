from __future__ import annotations

import json
import logging
from typing import Any

from pywebpush import WebPushException, webpush
from sqlalchemy import select

from app.core.config import get_settings
from app.db.models import Session
from app.db.session import session_scope
from datetime import datetime, timezone

from app.services.reminder_schedule import (
    demo_mode,
    late_notice_push,
    skip_late_windows,
    start_demo_clock,
    upcoming_live,
)
from app.services.telegram import timeline_url

log = logging.getLogger(__name__)


def vapid_configured() -> bool:
    settings = get_settings()
    return bool(settings.vapid_public_key.strip() and settings.vapid_private_key.strip())


def vapid_public_key() -> str:
    return get_settings().vapid_public_key.strip()


def _subscription(row: Session) -> dict[str, Any] | None:
    if not row.push_endpoint or not row.push_p256dh or not row.push_auth:
        return None
    return {
        "endpoint": row.push_endpoint,
        "keys": {"p256dh": row.push_p256dh, "auth": row.push_auth},
    }


def save_subscription(code: str, endpoint: str, p256dh: str, auth: str) -> bool:
    notice: dict[str, str] | None = None
    subscription: dict[str, Any] | None = None
    with session_scope() as db:
        row = db.scalar(select(Session).where(Session.public_code == code.upper()))
        if row is None:
            return False
        row.push_endpoint = endpoint.strip()
        row.push_p256dh = p256dh.strip()
        row.push_auth = auth.strip()
        if demo_mode():
            start_demo_clock(row)
        else:
            now = datetime.now(timezone.utc)
            skipped = skip_late_windows(row, now)
            if skipped and row.reminder_late_notice_sent_at is None:
                row.reminder_late_notice_sent_at = now
                notice = late_notice_push(skipped, upcoming_live(row, now), timeline_url(row.public_code))
                subscription = {
                    "endpoint": row.push_endpoint,
                    "keys": {"p256dh": row.push_p256dh, "auth": row.push_auth},
                }
    if notice and subscription:
        try:
            send_web_push(subscription, notice)
        except Exception:
            log.exception("Failed sending late-join push notice for session %s", code)
    return True


def clear_subscription(code: str) -> bool:
    with session_scope() as db:
        row = db.scalar(select(Session).where(Session.public_code == code.upper()))
        if row is None:
            return False
        row.push_endpoint = None
        row.push_p256dh = None
        row.push_auth = None
        return True


def clear_endpoint(endpoint: str) -> None:
    with session_scope() as db:
        row = db.scalar(select(Session).where(Session.push_endpoint == endpoint))
        if row is None:
            return
        row.push_endpoint = None
        row.push_p256dh = None
        row.push_auth = None


def send_web_push(subscription: dict[str, Any], payload: dict[str, str]) -> None:
    settings = get_settings()
    if not vapid_configured():
        raise RuntimeError("VAPID keys are not set")
    try:
        webpush(
            subscription_info=subscription,
            data=json.dumps(payload),
            vapid_private_key=settings.vapid_private_key.strip(),
            vapid_claims={"sub": settings.vapid_mailto.strip() or "mailto:preppath@localhost"},
        )
    except WebPushException as exc:
        status = getattr(exc.response, "status_code", None) if exc.response is not None else None
        if status in {404, 410}:
            endpoint = str(subscription.get("endpoint") or "")
            if endpoint:
                clear_endpoint(endpoint)
            log.info("Cleared expired push subscription")
            return
        raise
