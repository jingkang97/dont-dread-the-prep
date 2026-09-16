from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import TYPE_CHECKING, Any
from zoneinfo import ZoneInfo

from sqlalchemy.orm.attributes import flag_modified

from app.core.config import get_settings
from app.services.reminder_copy import ITEMS, item_body, tap_hint, wrap_html

SG = ZoneInfo("Asia/Singapore")
# Still send as a live reminder if the window became due in the last couple of minutes.
LATE_GRACE = timedelta(minutes=2)

if TYPE_CHECKING:
    from app.db.models import Session


def _delay_label(delay: timedelta) -> str:
    if delay <= timedelta(0):
        return "now"
    minutes = int(delay.total_seconds() // 60)
    if delay < timedelta(hours=1):
        return "1 min" if minutes == 1 else f"{minutes} min"
    hours = int(delay.total_seconds() // 3600)
    if delay < timedelta(days=1):
        return "1 hour" if hours == 1 else f"{hours} hours"
    days = delay.days
    return "1 day" if days == 1 else f"{days} days"


def demo_steps_for(events: list[dict[str, Any]] | None = None) -> list[dict[str, Any]]:
    """Compressed demo ladder: each live event one minute apart, then hourly and daily extras."""
    events = list(events or [])
    extras_n = 3 if events else 0
    minute_n = len(events) + extras_n + extras_n
    steps: list[dict[str, Any]] = []
    minute = 0

    def add_minute(event: dict[str, Any], *, key: str | None = None) -> None:
        nonlocal minute
        delay = timedelta(minutes=minute)
        steps.append(
            {
                "key": key or f"demo:{event['key']}",
                "delay": delay,
                "copy": event.get("copy_key") or "step",
                "title": event.get("title"),
                "body": event.get("body"),
                "html": event.get("html"),
                "go": event.get("go") or "timeline",
                "phase": f"Minute {minute + 1}/{max(minute_n, 1)}",
                "delay_label": _delay_label(delay),
            }
        )
        minute += 1

    for event in events:
        add_minute(event)

    sample = events[:3] or events
    for index in range(extras_n):
        event = sample[index % len(sample)]
        delay = timedelta(hours=index + 1)
        steps.append(
            {
                "key": f"h{index + 1}",
                "delay": delay,
                "copy": event.get("copy_key") or "step",
                "title": event.get("title"),
                "body": event.get("body"),
                "html": event.get("html"),
                "go": event.get("go") or "timeline",
                "phase": f"Hour {index + 1}/3",
                "delay_label": _delay_label(delay),
            }
        )
    for index in range(extras_n):
        event = sample[index % len(sample)]
        delay = timedelta(days=index + 1)
        steps.append(
            {
                "key": f"d{index + 1}",
                "delay": delay,
                "copy": event.get("copy_key") or "step",
                "title": event.get("title"),
                "body": event.get("body"),
                "html": event.get("html"),
                "go": event.get("go") or "timeline",
                "phase": f"Day {index + 1}/3",
                "delay_label": _delay_label(delay),
            }
        )
    return steps


def demo_fast_tick_span(events: list[dict[str, Any]] | None = None) -> timedelta:
    last = timedelta(0)
    for step in demo_steps_for(events):
        if step["delay"] < timedelta(hours=1):
            last = max(last, step["delay"])
    return last + timedelta(minutes=2)


def demo_mode() -> bool:
    return get_settings().telegram_reminder_test


def demo_body(step: dict[str, Any]) -> str:
    if step.get("body"):
        return str(step["body"])
    copy = step.get("copy")
    if copy in ITEMS:
        return item_body(ITEMS[copy])
    return item_body(ITEMS["step"])


def demo_title(step: dict[str, Any]) -> str:
    title = step.get("title") or ITEMS.get(step.get("copy") or "", ITEMS["step"])["title"]
    return f"{step['phase']} · {title}"


def demo_html(step: dict[str, Any]) -> str:
    long_html = step.get("html")
    if isinstance(long_html, str) and long_html.strip():
        # Demo prefixes the phase; the stored html already includes the live title.
        body = long_html.split("\n\n", 1)[-1] if "\n\n" in long_html else long_html
        return wrap_html(demo_title(step), body)
    return f"<b>{demo_title(step)}</b>\n\n{demo_body(step)}"


def demo_push_payload(step: dict[str, Any], url: str) -> dict[str, str]:
    return {
        "title": demo_title(step),
        "body": f"{demo_body(step)}\n\n{tap_hint(url)}",
        "url": url,
    }


def start_demo_clock(row: Session, *, restart: bool = False) -> None:
    if not restart and row.reminder_anchor_at is not None:
        return
    row.reminder_anchor_at = datetime.now(timezone.utc)
    row.reminder_demo_sent = 0
    row.reminder_demo_push_sent = 0


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
    if demo_mode():
        sent = max(0, int(row.reminder_demo_sent or 0))
        anchor = row.reminder_anchor_at
        items: list[dict[str, Any]] = []
        for index, step in enumerate(demo_steps_for(events)):
            at = anchor + step["delay"] if anchor is not None else None
            items.append(
                {
                    "key": step["key"],
                    "title": demo_title(step),
                    "copy_key": step["copy"],
                    "delay_label": step["delay_label"],
                    "body": demo_body(step),
                    "at": at,
                    "sent": index < sent,
                }
            )
        return items

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
