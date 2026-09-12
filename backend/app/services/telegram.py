from __future__ import annotations

import asyncio
import html
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import httpx
from sqlalchemy import select

from app.core.config import get_settings
from app.db.models import Session
from app.db.session import session_scope
from app.services.reminder_schedule import (
    demo_mode,
    late_notice_html,
    skip_late_windows,
    start_demo_clock,
    upcoming_live,
)

log = logging.getLogger(__name__)

API = "https://api.telegram.org/bot{token}/{method}"

WELCOME_TEST = (
    "Demo clock: 3 alerts at now, +1 min, and +2 min, then 3 hourly, then 3 daily."
)
NEED_CODE = (
    "Open PrepPath and tap Set reminders so I can attach this chat to your session."
)
UNKNOWN = (
    "I couldn't find session {code}. Open PrepPath and tap Set reminders again."
)
STOOL_CHART = Path(__file__).resolve().parent.parent / "assets" / "stool-chart.png"


def _token() -> str:
    return get_settings().telegram_bot_token.strip()


def _site_base() -> str:
    return get_settings().resolved_site_url


def timeline_url(code: str) -> str:
    return f"{_site_base()}/?s={code}&go=timeline"


def stool_url(code: str) -> str:
    return f"{_site_base()}/?s={code}&go=stool"


def can_use_url_button(url: str) -> bool:
    parsed = urlparse(url)
    host = (parsed.hostname or "").lower()
    if parsed.scheme != "https" or not host:
        return False
    return host not in {"localhost", "127.0.0.1", "::1"}


def with_open_hint(text: str, label: str, url: str) -> str:
    if can_use_url_button(url):
        return text
    return f"{text}\n\n{html.escape(label)}:\n<code>{html.escape(url)}</code>"


def url_button(label: str, url: str) -> tuple[str, str] | None:
    if can_use_url_button(url):
        return (label, url)
    return None


def _button_markup(label: str, url: str) -> dict[str, Any]:
    return {"inline_keyboard": [[{"text": label, "url": url}]]}


async def send_photo(
    chat_id: int,
    path: Path,
    caption: str,
    button: tuple[str, str] | None = None,
) -> None:
    token = _token()
    if not token:
        raise RuntimeError("TELEGRAM_BOT_TOKEN is not set")
    data: dict[str, Any] = {"chat_id": str(chat_id), "caption": caption, "parse_mode": "HTML"}
    if button:
        data["reply_markup"] = json.dumps(_button_markup(*button))
    async with httpx.AsyncClient(timeout=45) as client:
        with path.open("rb") as photo:
            response = await client.post(
                API.format(token=token, method="sendPhoto"),
                data=data,
                files={"photo": (path.name, photo, "image/png")},
            )
        payload = response.json()
        if not payload.get("ok"):
            raise RuntimeError(payload.get("description") or "Telegram sendPhoto failed")


async def telegram_call(method: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
    token = _token()
    if not token:
        raise RuntimeError("TELEGRAM_BOT_TOKEN is not set")
    async with httpx.AsyncClient(timeout=35) as client:
        response = await client.post(API.format(token=token, method=method), json=payload or {})
        data = response.json()
        if not data.get("ok"):
            raise RuntimeError(data.get("description") or f"Telegram {method} failed")
        return data


async def send_message(
    chat_id: int,
    text: str,
    button: tuple[str, str] | None = None,
) -> None:
    payload: dict[str, Any] = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": True,
    }
    if button:
        payload["reply_markup"] = _button_markup(*button)
    await telegram_call("sendMessage", payload)


def parse_start_code(text: str) -> str | None:
    parts = text.strip().split(maxsplit=1)
    if not parts:
        return None
    command = parts[0].split("@", 1)[0]
    if command != "/start":
        return None
    if len(parts) < 2:
        return None
    return parts[1].strip().upper()


def _show_session_debug() -> bool:
    settings = get_settings()
    if settings.telegram_reminder_test:
        return True
    return not can_use_url_button(settings.resolved_site_url)


def welcome_text(code: str, first_name: str | None) -> str:
    name = html.escape((first_name or "").strip())
    headline = f"You're set for reminders, {name}." if name else "You're set for reminders."
    bits: list[str] = []
    if get_settings().telegram_reminder_test:
        cadence = WELCOME_TEST
    else:
        cadence = (
            "You'll get three alerts before your colonoscopy: "
            "<b>T−72h</b>, <b>T−24h</b>, and <b>T−6h</b>."
        )
    if _show_session_debug():
        bits.append(f"Session {html.escape(code)}.")
    tail = f"\n\n{' '.join(bits)}" if bits else ""
    return (
        f"<b>{headline}</b>\n\n"
        f"{cadence}\n\n"
        "Food questions stay in PrepPath — Telegram is reminders only."
        f"{tail}"
    )


def _link_session(chat_id: int, code: str) -> dict[str, Any] | None:
    with session_scope() as db:
        row = db.scalar(select(Session).where(Session.public_code == code))
        if row is None:
            return None
        row.telegram_chat_id = chat_id
        row.wa_opt_in = True
        skipped: list[str] = []
        nxt = None
        if demo_mode():
            start_demo_clock(row, restart=True)
        else:
            now = datetime.now(timezone.utc)
            skipped = skip_late_windows(row, now)
            nxt = upcoming_live(row, now)
            if skipped:
                row.reminder_late_notice_sent_at = now
        return {
            "public_code": row.public_code,
            "first_name": row.first_name,
            "skipped": skipped,
            "next": nxt,
        }


def _code_for_chat(chat_id: int) -> str | None:
    with session_scope() as db:
        row = db.scalar(select(Session).where(Session.telegram_chat_id == chat_id))
        return row.public_code if row else None


async def handle_start(chat_id: int, text: str) -> None:
    code = parse_start_code(text)
    if not code:
        code = await asyncio.to_thread(_code_for_chat, chat_id)
    if not code:
        await send_message(chat_id, NEED_CODE)
        return

    linked = await asyncio.to_thread(_link_session, chat_id, code)
    if linked is None:
        await send_message(chat_id, UNKNOWN.format(code=code))
        return

    public_code = str(linked["public_code"])
    first_name = linked.get("first_name")
    url = timeline_url(public_code)
    await send_message(
        chat_id,
        with_open_hint(welcome_text(public_code, first_name if isinstance(first_name, str) else None), "Open timeline", url),
        button=url_button("Open timeline", url),
    )
    skipped = list(linked.get("skipped") or [])
    if skipped:
        try:
            await send_message(
                chat_id,
                with_open_hint(
                    late_notice_html(skipped, linked.get("next")),
                    "Open timeline",
                    url,
                ),
                button=url_button("Open timeline", url),
            )
        except Exception:
            log.exception("Failed sending late-join notice for session %s", public_code)
            await asyncio.to_thread(_clear_late_notice, public_code)
    log.info("Linked Telegram chat to session %s", public_code)


def _clear_late_notice(code: str) -> None:
    with session_scope() as db:
        row = db.scalar(select(Session).where(Session.public_code == code.upper()))
        if row is None:
            return
        row.reminder_late_notice_sent_at = None


async def handle_update(update: dict[str, Any]) -> None:
    message = update.get("message") or update.get("edited_message")
    if not isinstance(message, dict):
        return
    chat = message.get("chat") or {}
    chat_id = chat.get("id")
    text = message.get("text") or ""
    if chat_id is None or not text.startswith("/start"):
        return
    await handle_start(int(chat_id), text)


async def set_webhook(url: str) -> None:
    payload: dict[str, Any] = {
        "url": url,
        "allowed_updates": ["message"],
        "drop_pending_updates": False,
    }
    secret = get_settings().resolved_webhook_secret
    if secret:
        payload["secret_token"] = secret
    await telegram_call("setWebhook", payload)


async def poll_updates(stop: asyncio.Event) -> None:
    if not _token():
        return

    try:
        await telegram_call("deleteWebhook", {"drop_pending_updates": False})
    except Exception:
        log.exception("Could not clear Telegram webhook before polling")

    offset = 0
    log.info("Polling Telegram getUpdates")
    while not stop.is_set():
        try:
            data = await telegram_call(
                "getUpdates",
                {"offset": offset, "timeout": 25, "allowed_updates": ["message"]},
            )
            for update in data.get("result") or []:
                offset = int(update["update_id"]) + 1
                try:
                    await handle_update(update)
                except Exception:
                    log.exception("Failed handling Telegram update %s", update.get("update_id"))
        except asyncio.CancelledError:
            raise
        except Exception:
            log.exception("Telegram getUpdates failed")
            try:
                await asyncio.wait_for(stop.wait(), timeout=5)
            except asyncio.TimeoutError:
                continue


async def start_telegram_listener(stop: asyncio.Event) -> None:
    if not _token():
        return

    settings = get_settings()
    origin = settings.resolved_public_api_url
    webhook_url = f"{origin}/api/telegram/webhook" if origin.startswith("https://") else ""
    if webhook_url and not settings.telegram_poll:
        try:
            await set_webhook(webhook_url)
            log.info("Telegram webhook registered at %s", webhook_url)
            await stop.wait()
            return
        except asyncio.CancelledError:
            raise
        except Exception:
            log.exception("Could not set Telegram webhook; falling back to polling")

    if not settings.telegram_poll and settings.debug:
        log.info("Telegram poll off (set TELEGRAM_POLL=true to getUpdates locally)")
        await stop.wait()
        return

    await poll_updates(stop)
