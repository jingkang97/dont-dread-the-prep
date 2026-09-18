from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone
from typing import TYPE_CHECKING, Any
from zoneinfo import ZoneInfo

from sqlalchemy.orm.attributes import flag_modified

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


def reset_reminder_clock(row: Session) -> None:
    row.reminder_t72_sent_at = None
    row.reminder_t24_sent_at = None
    row.reminder_t6_sent_at = None
    row.reminder_anchor_at = None
    row.reminder_demo_sent = 0
    row.reminder_demo_push_sent = 0
    row.reminder_late_notice_sent_at = None
    row.reminder_doses_sent = []
    flag_modified(row, "reminder_doses_sent")


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def events_sent(row: Session) -> list[str]:
    raw = row.reminder_doses_sent
    if not isinstance(raw, list):
        return []
    return [str(item) for item in raw]


def mark_event_sent(row: Session, key: str) -> None:
    sent = events_sent(row)
    if key in sent:
        return
    sent.append(key)
    row.reminder_doses_sent = sent
    flag_modified(row, "reminder_doses_sent")


def unmark_event_sent(row: Session, key: str) -> None:
    row.reminder_doses_sent = [item for item in events_sent(row) if item != key]
    flag_modified(row, "reminder_doses_sent")


def skip_late_events(row: Session, now: datetime, events: list[dict[str, Any]]) -> list[dict[str, Any]]:
    skipped: list[dict[str, Any]] = []
    sent = set(events_sent(row))
    current = _as_utc(now)
    for event in events:
        key = str(event["key"])
        if key in sent:
            continue
        if current > _as_utc(event["at"]) + LATE_GRACE:
            mark_event_sent(row, key)
            skipped.append(event)
    return skipped


def upcoming_event(row: Session, now: datetime, events: list[dict[str, Any]]) -> dict[str, Any] | None:
    sent = set(events_sent(row))
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


def next_unsent_event(row: Session, events: list[dict[str, Any]]) -> dict[str, Any] | None:
    sent = set(events_sent(row))
    for event in events:
        if str(event["key"]) not in sent:
            return event
    return None


def report_at(row: Session) -> datetime:
    return datetime.combine(row.procedure_date, row.reporting_time, tzinfo=SG)


def _format_sg(when: datetime) -> str:
    local = when.astimezone(SG)
    return local.strftime("%d %b, %I:%M %p").lstrip("0").replace(" 0", " ")


def late_notice_html(skipped: list[dict[str, Any]], nxt: dict[str, Any] | None) -> str:
    labels = ", ".join(f"<b>{event['title']}</b>" for event in skipped)
    lines = [
        "<b>Some reminder windows have already passed.</b>",
        "",
        f"These were due before reminders were turned on: {labels}.",
    ]
    for event in skipped:
        lines.append(f"• <b>{event['title']}</b> — {event['body']}")
    lines.append("")
    if nxt:
        lines.append(f"Your next reminder is <b>{nxt['title']}</b> on {_format_sg(nxt['at'])}.")
    else:
        lines.append("There are no further timed reminders for this appointment.")
    return "\n".join(lines)


def late_notice_push(
    skipped: list[dict[str, Any]], nxt: dict[str, Any] | None, url: str
) -> dict[str, str]:
    titles = " and ".join(str(event["title"]) for event in skipped)
    if nxt:
        body = f"{titles} already passed. Next: {nxt['title']} on {_format_sg(nxt['at'])}."
    else:
        body = f"{titles} already passed. There are no further timed reminders."
    return {"title": "Some reminder windows have passed", "body": body, "url": url}


def reminder_plan(row: Session, events: list[dict[str, Any]] | None = None) -> list[dict[str, Any]]:
    events = list(events or [])
    sent = set(events_sent(row))
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
