from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import TYPE_CHECKING, Any
from zoneinfo import ZoneInfo

from sqlalchemy.orm.attributes import flag_modified

from app.core.config import get_settings
from app.services.reminder_copy import ITEMS, item_body, tap_hint

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
DEMO_HOURLY = ("t72", "t24", "t6")
DEMO_DAILY = ("t72", "t24", "t6")


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


def _dose_copy(agent: str | None) -> str:
    return "peg" if agent == "peg" else "dose"


def demo_steps_for(doses: list[dict[str, Any]] | None = None) -> list[dict[str, Any]]:
    """Compressed demo ladder: 72h / 24h / each prep dose / 6h, then hourly and daily."""
    doses = list(doses or [])
    minute_n = 2 + len(doses) + 1
    steps: list[dict[str, Any]] = []
    minute = 0

    def add_minute(
        *,
        key: str,
        copy: str,
        title: str | None = None,
        dose_agent: str | None = None,
    ) -> None:
        nonlocal minute
        delay = timedelta(minutes=minute)
        step: dict[str, Any] = {
            "key": key,
            "delay": delay,
            "copy": copy,
            "phase": f"Minute {minute + 1}/{minute_n}",
            "delay_label": _delay_label(delay),
        }
        if title:
            step["title"] = title
        if dose_agent:
            step["dose_agent"] = dose_agent
        steps.append(step)
        minute += 1

    add_minute(key="m1", copy="t72")
    add_minute(key="m2", copy="t24")
    for dose in doses:
        agent = str(dose.get("agent") or "picoprep")
        add_minute(
            key=f"demo-dose:{dose['key']}",
            copy=_dose_copy(agent),
            title=str(dose.get("title") or "Prep dose"),
            dose_agent=agent,
        )
    add_minute(key="m-t6", copy="t6")

    for index, copy in enumerate(DEMO_HOURLY, start=1):
        delay = timedelta(hours=index)
        steps.append(
            {
                "key": f"h{index}",
                "delay": delay,
                "copy": copy,
                "phase": f"Hour {index}/3",
                "delay_label": _delay_label(delay),
            }
        )
    for index, copy in enumerate(DEMO_DAILY, start=1):
        delay = timedelta(days=index)
        steps.append(
            {
                "key": f"d{index}",
                "delay": delay,
                "copy": copy,
                "phase": f"Day {index}/3",
                "delay_label": _delay_label(delay),
            }
        )
    return steps


def demo_fast_tick_span(doses: list[dict[str, Any]] | None = None) -> timedelta:
    last = timedelta(0)
    for step in demo_steps_for(doses):
        if step["delay"] < timedelta(hours=1):
            last = max(last, step["delay"])
    return last + timedelta(minutes=2)


def demo_mode() -> bool:
    return get_settings().telegram_reminder_test


def demo_body(step: dict[str, Any]) -> str:
    if step.get("body"):
        return str(step["body"])
    return item_body(ITEMS[step["copy"]])


def demo_title(step: dict[str, Any]) -> str:
    title = step.get("title") or ITEMS[step["copy"]]["title"]
    return f"{step['phase']} · {title}"


def demo_html(step: dict[str, Any]) -> str:
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


def doses_sent(row: Session) -> list[str]:
    raw = row.reminder_doses_sent
    if not isinstance(raw, list):
        return []
    return [str(item) for item in raw]


def mark_dose_sent(row: Session, key: str) -> None:
    sent = doses_sent(row)
    if key in sent:
        return
    sent.append(key)
    row.reminder_doses_sent = sent
    flag_modified(row, "reminder_doses_sent")


def unmark_dose_sent(row: Session, key: str) -> None:
    row.reminder_doses_sent = [item for item in doses_sent(row) if item != key]
    flag_modified(row, "reminder_doses_sent")


def skip_late_doses(row: Session, now: datetime, doses: list[dict[str, Any]]) -> list[str]:
    skipped: list[str] = []
    sent = set(doses_sent(row))
    for dose in doses:
        key = str(dose["key"])
        if key in sent:
            continue
        if _as_utc(now) > _as_utc(dose["at"]) + LATE_GRACE:
            mark_dose_sent(row, key)
            skipped.append(key)
    return skipped


def upcoming_dose(row: Session, now: datetime, doses: list[dict[str, Any]]) -> dict[str, Any] | None:
    sent = set(doses_sent(row))
    current = _as_utc(now)
    for dose in doses:
        if str(dose["key"]) in sent:
            continue
        due = _as_utc(dose["at"])
        if current > due + LATE_GRACE:
            continue
        if current >= due:
            return dose
    return None


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


def reminder_plan(
    row: Session, report_at: datetime, doses: list[dict[str, Any]] | None = None
) -> list[dict[str, Any]]:
    if demo_mode():
        sent = max(0, int(row.reminder_demo_sent or 0))
        anchor = row.reminder_anchor_at
        items: list[dict[str, Any]] = []
        for index, step in enumerate(demo_steps_for(doses)):
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
    items = [
        {
            "key": key,
            "title": ITEMS[key]["title"],
            "copy_key": key,
            "delay_label": f"{HOURS_BEFORE[key]} hours before",
            "at": report_at - timedelta(hours=HOURS_BEFORE[key]),
            "sent": live_sent[key],
        }
        for key in LIVE_KEYS
    ]
    sent_doses = set(doses_sent(row))
    for dose in doses or []:
        agent = dose.get("agent") or "picoprep"
        items.append(
            {
                "key": f"dose:{dose['key']}",
                "title": dose["title"],
                "copy_key": "peg" if agent == "peg" else "dose",
                "delay_label": "",
                "at": dose["at"],
                "sent": str(dose["key"]) in sent_doses,
            }
        )
    return items
