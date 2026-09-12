from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import TYPE_CHECKING, Any
from zoneinfo import ZoneInfo

from app.core.config import get_settings
from app.services.reminder_copy import ITEMS

SG = ZoneInfo("Asia/Singapore")
SENT_ATTR = {
    "t72": "reminder_t72_sent_at",
    "t24": "reminder_t24_sent_at",
    "t6": "reminder_t6_sent_at",
}
# Still send as a live alert if the window became due in the last couple of minutes.
LATE_GRACE = timedelta(minutes=2)

if TYPE_CHECKING:
    from app.db.models import Session

LIVE_KEYS = ("t72", "t24", "t6")
HOURS_BEFORE = {"t72": 72, "t24": 24, "t6": 6}

# Demo ladder from the moment Telegram or push is linked:
# now / +1 min / +2 min, then 3 hourly, then 3 daily.
DEMO_STEPS: tuple[dict[str, Any], ...] = (
    {"key": "m1", "delay": timedelta(seconds=0), "copy": "t72", "phase": "Minute 1/3", "delay_label": "now"},
    {"key": "m2", "delay": timedelta(minutes=1), "copy": "t24", "phase": "Minute 2/3", "delay_label": "1 min"},
    {"key": "m3", "delay": timedelta(minutes=2), "copy": "t6", "phase": "Minute 3/3", "delay_label": "2 min"},
    {"key": "h1", "delay": timedelta(hours=1), "copy": "t72", "phase": "Hour 1/3", "delay_label": "1 hour"},
    {"key": "h2", "delay": timedelta(hours=2), "copy": "t24", "phase": "Hour 2/3", "delay_label": "2 hours"},
    {"key": "h3", "delay": timedelta(hours=3), "copy": "t6", "phase": "Hour 3/3", "delay_label": "3 hours"},
    {"key": "d1", "delay": timedelta(days=1), "copy": "t72", "phase": "Day 1/3", "delay_label": "1 day"},
    {"key": "d2", "delay": timedelta(days=2), "copy": "t24", "phase": "Day 2/3", "delay_label": "2 days"},
    {"key": "d3", "delay": timedelta(days=3), "copy": "t6", "phase": "Day 3/3", "delay_label": "3 days"},
)


def demo_mode() -> bool:
    return get_settings().telegram_reminder_test


def demo_title(step: dict[str, Any]) -> str:
    return f"{step['phase']} · {ITEMS[step['copy']]['title']}"


def demo_html(step: dict[str, Any]) -> str:
    item = ITEMS[step["copy"]]
    text = f"<b>{demo_title(step)}</b>\n\n{item['body']}"
    extra = item.get("extra")
    if extra:
        text += f"\n\n{extra}"
    return text


def demo_push_payload(step: dict[str, Any], url: str) -> dict[str, str]:
    item = ITEMS[step["copy"]]
    body = item["body"]
    extra = item.get("extra")
    if extra:
        body = f"{body}\n\n{extra}"
    return {"title": demo_title(step), "body": body, "url": url}


def start_demo_clock(row: Session, *, restart: bool = False) -> None:
    if not restart and row.reminder_anchor_at is not None:
        return
    row.reminder_anchor_at = datetime.now(timezone.utc)
    row.reminder_demo_sent = 0


def reset_reminder_clock(row: Session) -> None:
    row.reminder_t72_sent_at = None
    row.reminder_t24_sent_at = None
    row.reminder_t6_sent_at = None
    row.reminder_anchor_at = None
    row.reminder_demo_sent = 0
    row.reminder_late_notice_sent_at = None


def report_at(row: Session) -> datetime:
    return datetime.combine(row.procedure_date, row.reporting_time, tzinfo=SG)


def trigger_at(row: Session, key: str) -> datetime:
    return report_at(row) - timedelta(hours=HOURS_BEFORE[key])


def _format_sg(when: datetime) -> str:
    local = when.astimezone(SG)
    return local.strftime("%d %b, %I:%M %p").lstrip("0").replace(" 0", " ")


def late_keys(row: Session, now: datetime) -> list[str]:
    overdue: list[str] = []
    for key in LIVE_KEYS:
        if getattr(row, SENT_ATTR[key]) is not None:
            continue
        if now > trigger_at(row, key) + LATE_GRACE:
            overdue.append(key)
    return overdue


def skip_late_windows(row: Session, now: datetime) -> list[str]:
    skipped = late_keys(row, now)
    for key in skipped:
        setattr(row, SENT_ATTR[key], now)
    return skipped


def upcoming_live(row: Session, now: datetime) -> tuple[str, datetime] | None:
    for key in LIVE_KEYS:
        if getattr(row, SENT_ATTR[key]) is not None:
            continue
        due = trigger_at(row, key)
        if now <= due + LATE_GRACE:
            return key, due
    return None


def late_notice_html(skipped: list[str], nxt: tuple[str, datetime] | None) -> str:
    labels = ", ".join(f"<b>{ITEMS[key]['title']}</b>" for key in skipped)
    lines = [
        "<b>Some reminder windows have already passed.</b>",
        "",
        f"These were due before reminders were turned on: {labels}.",
    ]
    for key in skipped:
        item = ITEMS[key]
        lines.append(f"• <b>{item['title']}</b> — {item['body']}")
    lines.append("")
    if nxt:
        key, when = nxt
        lines.append(
            f"Your next alert is <b>{ITEMS[key]['title']}</b> on {_format_sg(when)}."
        )
    else:
        lines.append("There are no further timed alerts for this appointment.")
    return "\n".join(lines)


def late_notice_push(skipped: list[str], nxt: tuple[str, datetime] | None, url: str) -> dict[str, str]:
    titles = " and ".join(ITEMS[key]["title"] for key in skipped)
    if nxt:
        key, when = nxt
        body = f"{titles} already passed. Next: {ITEMS[key]['title']} on {_format_sg(when)}."
    else:
        body = f"{titles} already passed. There are no further timed alerts."
    return {"title": "Some reminder windows have passed", "body": body, "url": url}


def reminder_plan(row: Session, report_at: datetime) -> list[dict[str, Any]]:
    if demo_mode():
        sent = max(0, int(row.reminder_demo_sent or 0))
        anchor = row.reminder_anchor_at
        items: list[dict[str, Any]] = []
        for index, step in enumerate(DEMO_STEPS):
            at = anchor + step["delay"] if anchor is not None else None
            items.append(
                {
                    "key": step["key"],
                    "title": demo_title(step),
                    "copy_key": step["copy"],
                    "delay_label": step["delay_label"],
                    "at": at,
                    "sent": index < sent,
                }
            )
        return items

    live_sent = {
        "t72": row.reminder_t72_sent_at is not None,
        "t24": row.reminder_t24_sent_at is not None,
        "t6": row.reminder_t6_sent_at is not None,
    }
    return [
        {
            "key": key,
            "title": ITEMS[key]["title"],
            "copy_key": key,
            "delay_label": f"T−{HOURS_BEFORE[key]}h",
            "at": report_at - timedelta(hours=HOURS_BEFORE[key]),
            "sent": live_sent[key],
        }
        for key in LIVE_KEYS
    ]
