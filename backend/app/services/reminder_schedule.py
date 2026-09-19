from __future__ import annotations

import html
import re
from datetime import datetime, timedelta, timezone
from typing import TYPE_CHECKING, Any, Literal
from zoneinfo import ZoneInfo

from sqlalchemy.orm.attributes import flag_modified

from app.services.translations import translate_texts

SG = ZoneInfo("Asia/Singapore")
# Still send as a live reminder if the window became due in the last couple of minutes.
LATE_GRACE = timedelta(minutes=2)
# Old demo ladder titles: "Minute 1/16 · 14 days before · …"
_DEMO_LADDER_TITLE = re.compile(r"(?i)\b(?:minute|hour|day)\s+\d+\s*/\s*\d+\s*·")


def is_demo_ladder_event(event: dict[str, Any] | None) -> bool:
    if not event:
        return False
    blob = f"{event.get('title') or ''} {event.get('html') or ''}"
    return _DEMO_LADDER_TITLE.search(blob) is not None

if TYPE_CHECKING:
    from app.db.models import Session

Channel = Literal["telegram", "push"]


def _sent_col(channel: Channel) -> str:
    return "reminder_doses_sent" if channel == "telegram" else "reminder_push_sent"


def _late_col(channel: Channel) -> str:
    return "reminder_late_notice_sent_at" if channel == "telegram" else "reminder_push_late_notice_sent_at"


def reset_reminder_clock(row: Session) -> None:
    row.reminder_t72_sent_at = None
    row.reminder_t24_sent_at = None
    row.reminder_t6_sent_at = None
    row.reminder_anchor_at = None
    row.reminder_demo_sent = 0
    row.reminder_demo_push_sent = 0
    row.reminder_late_notice_sent_at = None
    row.reminder_push_late_notice_sent_at = None
    row.reminder_doses_sent = []
    row.reminder_push_sent = []
    flag_modified(row, "reminder_doses_sent")
    flag_modified(row, "reminder_push_sent")


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def events_sent(row: Session, channel: Channel = "telegram") -> list[str]:
    raw = getattr(row, _sent_col(channel), None)
    if not isinstance(raw, list):
        return []
    return [str(item) for item in raw]


def mark_event_sent(row: Session, key: str, channel: Channel = "telegram") -> None:
    sent = events_sent(row, channel)
    if key in sent:
        return
    sent.append(key)
    setattr(row, _sent_col(channel), sent)
    flag_modified(row, _sent_col(channel))


def unmark_event_sent(row: Session, key: str, channel: Channel = "telegram") -> None:
    col = _sent_col(channel)
    setattr(row, col, [item for item in events_sent(row, channel) if item != key])
    flag_modified(row, col)


def late_notice_at(row: Session, channel: Channel) -> datetime | None:
    value = getattr(row, _late_col(channel), None)
    return value if isinstance(value, datetime) else None


def mark_late_notice(row: Session, channel: Channel, when: datetime) -> None:
    setattr(row, _late_col(channel), when)


def clear_late_notice(row: Session, channel: Channel) -> None:
    setattr(row, _late_col(channel), None)


def clear_channel(row: Session, channel: Channel) -> None:
    """Opt-out: drop this channel so leftover due windows cannot fire on it."""
    if channel == "telegram":
        row.telegram_chat_id = None
    else:
        row.push_endpoint = None
        row.push_p256dh = None
        row.push_auth = None
    setattr(row, _sent_col(channel), [])
    flag_modified(row, _sent_col(channel))
    clear_late_notice(row, channel)


def events_already_due(now: datetime, events: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Windows already due — recap these on opt-in instead of live-sending."""
    current = _as_utc(now)
    return [event for event in events if current >= _as_utc(event["at"])]


def catch_up_due_events(
    row: Session, now: datetime, events: list[dict[str, Any]], channel: Channel
) -> list[dict[str, Any]]:
    """Mark every already-due window sent on this channel so a later tick cannot duplicate it."""
    current = _as_utc(now)
    caught: list[dict[str, Any]] = []
    sent = set(events_sent(row, channel))
    for event in events:
        key = str(event["key"])
        if key in sent:
            continue
        if current >= _as_utc(event["at"]):
            mark_event_sent(row, key, channel)
            caught.append(event)
    return caught


def skip_late_events(
    row: Session, now: datetime, events: list[dict[str, Any]], channel: Channel = "telegram"
) -> list[dict[str, Any]]:
    skipped: list[dict[str, Any]] = []
    sent = set(events_sent(row, channel))
    current = _as_utc(now)
    for event in events:
        key = str(event["key"])
        if key in sent:
            continue
        if current > _as_utc(event["at"]) + LATE_GRACE:
            mark_event_sent(row, key, channel)
            skipped.append(event)
    return skipped


def upcoming_event(
    row: Session, now: datetime, events: list[dict[str, Any]], channel: Channel = "telegram"
) -> dict[str, Any] | None:
    sent = set(events_sent(row, channel))
    current = _as_utc(now)
    for event in events:
        if str(event["key"]) in sent:
            continue
        due = _as_utc(event["at"])
        if current > due + LATE_GRACE:
            continue
        if current >= due:
            return event
    return None


def next_unsent_event(
    row: Session, events: list[dict[str, Any]], channel: Channel = "telegram"
) -> dict[str, Any] | None:
    sent = set(events_sent(row, channel))
    for event in events:
        if str(event["key"]) not in sent:
            return event
    return None


def report_at(row: Session) -> datetime:
    return datetime.combine(row.procedure_date, row.reporting_time, tzinfo=SG)


def _format_sg(when: datetime, lang: str = "en") -> str:
    local = when.astimezone(SG)
    if lang == "zh":
        hour = local.hour % 12 or 12
        period = "上午" if local.hour < 12 else "下午"
        return f"{local.month}月 {local.day} 日 {period} {hour}:{local.minute:02d}"
    return local.strftime("%d %b, %I:%M %p").lstrip("0").replace(" 0", " ")


def _tx(lang: str, texts: list[str]) -> list[str]:
    if not lang or lang == "en":
        return list(texts)
    return translate_texts(lang, texts)


def _tg_escape(value: str) -> str:
    return html.escape(value, quote=False)


def _tg_bold(value: str) -> str:
    return f"<b>{_tg_escape(value)}</b>"


def late_notice_html(skipped: list[dict[str, Any]], nxt: dict[str, Any] | None, lang: str = "en") -> str:
    heading, lead, next_line, none_line = _tx(
        lang,
        [
            "Some reminder windows have already passed.",
            "These were due before reminders were turned on: {labels}.",
            "Your next reminder is {title} on {when}.",
            "There are no further timed reminders for this appointment.",
        ],
    )
    heading, lead, next_line, none_line = (
        _tg_escape(heading),
        _tg_escape(lead),
        _tg_escape(next_line),
        _tg_escape(none_line),
    )
    titles = _tx(lang, [str(event.get("title") or "") for event in skipped])
    bodies = _tx(lang, [str(event.get("body") or "") for event in skipped])
    labels = ", ".join(
        _tg_bold(title or str(event["title"])) for title, event in zip(titles, skipped, strict=True)
    )
    lines = [
        f"<b>{heading}</b>",
        "",
        lead.replace("{labels}", labels),
    ]
    for title, body, event in zip(titles, bodies, skipped, strict=True):
        lines.append(
            f"• {_tg_bold(title or str(event['title']))} — {_tg_escape(body or str(event.get('body') or ''))}"
        )
    lines.append("")
    if nxt:
        nxt_title = _tx(lang, [str(nxt["title"])])[0]
        lines.append(
            next_line.replace("{title}", _tg_bold(nxt_title)).replace(
                "{when}", _tg_escape(_format_sg(nxt["at"], lang))
            )
        )
    else:
        lines.append(none_line)
    return "\n".join(lines)


def late_notice_push(
    skipped: list[dict[str, Any]], nxt: dict[str, Any] | None, url: str, lang: str = "en"
) -> dict[str, str]:
    titles = " and ".join(_tx(lang, [str(event["title"]) for event in skipped]))
    heading, with_next, without_next = _tx(
        lang,
        [
            "Some reminder windows have passed",
            "{titles} already passed. Next: {title} on {when}.",
            "{titles} already passed. There are no further timed reminders.",
        ],
    )
    if nxt:
        nxt_title = _tx(lang, [str(nxt["title"])])[0]
        body = (
            with_next.replace("{titles}", titles)
            .replace("{title}", nxt_title)
            .replace("{when}", _format_sg(nxt["at"], lang))
        )
    else:
        body = without_next.replace("{titles}", titles)
    return {"title": heading, "body": body, "url": url}


def reminder_plan(row: Session, events: list[dict[str, Any]] | None = None) -> list[dict[str, Any]]:
    events = list(events or [])
    sent = set(events_sent(row, "telegram")) | set(events_sent(row, "push"))
    return [
        {
            "key": event["key"],
            "title": event["title"],
            "copy_key": event.get("copy_key") or "step",
            "delay_label": "",
            "body": event.get("body") or "",
            "at": event["at"],
            "sent": str(event["key"]) in sent,
        }
        for event in events
    ]
