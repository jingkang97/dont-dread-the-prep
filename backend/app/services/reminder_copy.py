from __future__ import annotations

import html
from datetime import date, datetime, time
from typing import Any, TypedDict


class ReminderCopy(TypedDict, total=False):
    title: str
    body: str
    extra: str


# Fallback labels for demo extras and older clients.
ITEMS: dict[str, ReminderCopy] = {
    "t14": {
        "title": "14 days before · Medication check",
        "body": "Check which medications you may need to stop next week.",
    },
    "med7": {
        "title": "7 days before · Stop certain medications",
        "body": "Stop medications as instructed by your clinic",
    },
    "sglt2": {
        "title": "Stop SGLT2 inhibitors",
        "body": "Stop your SGLT2 inhibitor today, if instructed.",
    },
    "diet": {
        "title": "3 days before · Start low-residue diet",
        "body": "Start your prescribed low-residue diet today.",
    },
    "prep_start": {
        "title": "1 day before · Start bowel preparation",
        "body": "Start your prescribed bowel preparation today.",
    },
    "stool": {
        "title": "Check your stool",
        "body": "If still brown, cloudy or solid, contact your clinic.",
    },
    "fast": {
        "title": "Stop all fluids",
        "body": "Stop drinking all fluids, including water, now.",
    },
    "dose": {
        "title": "Prep dose",
        "body": "Time to mix and drink this dose.",
    },
    "peg": {
        "title": "PEG dose",
        "body": "Time to mix and drink this dose.",
    },
    "step": {
        "title": "Timeline step",
        "body": "See your timeline for this step.",
    },
}


def item_body(item: ReminderCopy) -> str:
    extra = item.get("extra")
    return f"{item['body']}\n\n{extra}" if extra else item["body"]


def telegram_html(key: str) -> str:
    item = ITEMS[key]
    return f"<b>{item['title']}</b>\n\n{item_body(item)}"


def tap_hint(url: str) -> str:
    return "Tap to open the stool guide." if "go=stool" in url else "Tap to open your timeline."


def push_payload(title: str, body: str, url: str) -> dict[str, str]:
    return {"title": title, "body": f"{body}\n\n{tap_hint(url)}", "url": url}


def wrap_html(title: str, long_html: str) -> str:
    return f"<b>{html.escape(title)}</b>\n\n{long_html}"


REMINDERS = {key: telegram_html(key) for key in ITEMS}


def _esc(value: str) -> str:
    return html.escape(value)


def fmt_date(value: date) -> str:
    return value.strftime("%d %b %Y").lstrip("0").replace(" 0", " ")


def fmt_time(value: time) -> str:
    return datetime.combine(date.min, value).strftime("%I:%M %p").lstrip("0")


def days_phrase(n: int) -> str:
    n = abs(int(n))
    return "1 day" if n == 1 else f"{n} days"


def hours_phrase(hours: float) -> str:
    if abs(hours - round(hours)) < 0.05:
        n = int(round(hours))
        return "1 hour" if n == 1 else f"{n} hours"
    text = f"{hours:.1f}".rstrip("0").rstrip(".")
    return f"{text} hours"


def _ctx(hospital: str, procedure_date: date, reporting_time: time) -> dict[str, str]:
    return {
        "hospital": _esc(hospital),
        "date": _esc(fmt_date(procedure_date)),
        "time": _esc(fmt_time(reporting_time)),
    }


def t14_copy(hospital: str, procedure_date: date, reporting_time: time) -> dict[str, str]:
    ctx = _ctx(hospital, procedure_date, reporting_time)
    title = "14 days before · Medication check"
    body = "Check which medications you may need to stop next week."
    long_html = (
        f"<b>Upcoming colonoscopy at {ctx['hospital']}: {ctx['date']}</b>\n\n"
        f"Your colonoscopy is scheduled for <b>{ctx['date']}</b> and <b>{ctx['time']}</b>.\n\n"
        "Some medications may need to be stopped or adjusted <b>1 week before your colonoscopy</b>.\n\n"
        "Please check the preparation instructions provided by your hospital to see if this applies "
        "to any of your medications. <b>Do not stop any medication unless instructed to do so.</b>\n\n"
        "If you are unsure, please contact your healthcare team for advice."
    )
    return {"copy_key": "t14", "title": title, "body": body, "html": wrap_html(title, long_html), "go": "timeline"}


def med7_copy(
    hospital: str, procedure_date: date, reporting_time: time, *, days: int
) -> dict[str, str]:
    ctx = _ctx(hospital, procedure_date, reporting_time)
    when = days_phrase(days)
    title = f"{when} before · Stop certain medications"
    body = "Stop medications as instructed by your clinic"
    long_html = (
        f"<b>Upcoming colonoscopy at {ctx['hospital']}: {ctx['date']}</b>\n\n"
        f"Your colonoscopy is in <b>{when}</b>.\n\n"
        f"If you were instructed to stop or adjust certain medications <b>{when} before your colonoscopy</b>, "
        "please do so <b>TODAY</b>. This may include certain blood-thinning medications, Iron supplements, "
        "anti-diarrhea medications and blood-thinning supplements.\n\n"
        "Please follow the medication instructions provided by your hospital. "
        "<b>Do not stop any medication unless you have been instructed to do so.</b>\n\n"
        "If you are unsure which medications to stop or adjust, please contact your healthcare team for advice."
    )
    return {"copy_key": "med7", "title": title, "body": body, "html": wrap_html(title, long_html), "go": "timeline"}


def sglt2_copy(
    hospital: str, procedure_date: date, reporting_time: time, *, days: int
) -> dict[str, str]:
    ctx = _ctx(hospital, procedure_date, reporting_time)
    when = days_phrase(days)
    title = f"{when} before · Stop SGLT2 inhibitors"
    body = "Stop your SGLT2 inhibitor today, if instructed."
    long_html = (
        f"<b>Upcoming colonoscopy at {ctx['hospital']}: {ctx['date']}</b>\n\n"
        f"Your colonoscopy is in <b>{when}</b>.\n\n"
        f"If you are taking an SGLT2 inhibitor and have been instructed to stop it <b>{when} before your "
        "colonoscopy</b>, please stop it <b>TODAY</b>.\n\n"
        "SGLT2 inhibitors include:\n"
        "• Dapagliflozin (e.g. Forxiga)\n"
        "• Empagliflozin (e.g. Jardiance)\n"
        "• Canagliflozin (e.g. Invokana)\n"
        "• Combination medicines containing dapagliflozin or empagliflozin or canagliflozin "
        "(e.g. Xigduo XR, Jardiance Duo, Glyxambi, Invokamet, Invokamet XR)\n\n"
        "Please check the medication instructions provided by your hospital. "
        "<b>Do not stop any medication unless you have been instructed to do so.</b>\n\n"
        "If you are unsure whether your medication contains dapagliflozin or empagliflozin, "
        "please contact your healthcare team for advice."
    )
    return {"copy_key": "sglt2", "title": title, "body": body, "html": wrap_html(title, long_html), "go": "timeline"}


def diet_copy(
    hospital: str, procedure_date: date, reporting_time: time, *, days: int
) -> dict[str, str]:
    ctx = _ctx(hospital, procedure_date, reporting_time)
    when = days_phrase(days)
    title = f"{when} before · Start low-residue diet"
    body = "Start your prescribed low-residue diet today."
    long_html = (
        f"<b>Upcoming colonoscopy at {ctx['hospital']}: {ctx['date']}</b>\n\n"
        f"Your colonoscopy is in <b>{when}</b>.\n\n"
        "<b>Please start your low-residue diet TODAY</b>, as prescribed by your clinic.\n\n"
        "Follow the dietary instructions provided by your clinic on <b>what you can eat and what you should "
        "avoid</b> in the days leading up to your colonoscopy.\n\n"
        "Following the recommended diet helps prepare your bowel for a successful colonoscopy.\n\n"
        "If you are unsure about what you can eat, please refer to your clinic's instructions or contact "
        "your healthcare team."
    )
    return {"copy_key": "diet", "title": title, "body": body, "html": wrap_html(title, long_html), "go": "timeline"}


def prep_start_copy(hospital: str, procedure_date: date, reporting_time: time) -> dict[str, str]:
    ctx = _ctx(hospital, procedure_date, reporting_time)
    title = "1 day before · Start bowel preparation"
    body = "Start your prescribed bowel preparation today."
    long_html = (
        f"<b>Your colonoscopy at {ctx['hospital']} is tomorrow: {ctx['date']}</b>\n\n"
        f"Your colonoscopy is scheduled for <b>{ctx['date']}</b> and <b>{ctx['time']}</b>.\n\n"
        "<b>Start your prescribed bowel preparation today.</b>\n\n"
        "<b>Tips to make it easier to drink</b>\n"
        "• Chill the bowel preparation solution"
    )
    return {
        "copy_key": "prep_start",
        "title": title,
        "body": body,
        "html": wrap_html(title, long_html),
        "go": "timeline",
    }


def stool_copy(*, hours: float) -> dict[str, str]:
    when = hours_phrase(hours)
    title = f"{when} before · Check your stool"
    body = "If still brown, cloudy or solid, contact your clinic."
    long_html = (
        "<b>Check your stool before your colonoscopy</b>\n\n"
        "Your bowel preparation is working well when your stool becomes:\n\n"
        "✓ Light yellow or yellowish\n"
        "✓ Watery\n"
        "✓ Clear or see-through, similar to urine\n"
        "✓ With little or no solid material\n\n"
        "<b>The goal: Light yellow, watery and clear.</b>\n\n"
        f"<b>{when} before your scheduled colonoscopy:</b>\n"
        "If your stool is still brown, cloudy or contains solid pieces, please contact your clinic "
        "for further instructions."
    )
    return {"copy_key": "stool", "title": title, "body": body, "html": wrap_html(title, long_html), "go": "stool"}


def fast_copy(*, hours: float) -> dict[str, str]:
    when = hours_phrase(hours)
    title = f"{when} before · Stop all fluids"
    body = "Stop drinking all fluids, including water, now."
    long_html = (
        f"<b>Your colonoscopy is in {when}</b>\n\n"
        "Please <b>STOP drinking all fluids including water.</b>\n\n"
        "Please do not drink again until after your colonoscopy, unless otherwise instructed by your "
        "healthcare team.\n\n"
        "Following these instructions is important for your safety during the procedure."
    )
    return {"copy_key": "fast", "title": title, "body": body, "html": wrap_html(title, long_html), "go": "timeline"}


def dose_copy(title: str, *, agent: str, detail: str = "") -> dict[str, str]:
    copy_key = "peg" if agent == "peg" else "dose"
    body = "Time to mix and drink this dose."
    detail_html = f"\n\n{_esc(detail)}" if detail.strip() else ""
    long_html = f"{_esc(body)}{detail_html}"
    return {
        "copy_key": copy_key,
        "title": title,
        "body": body,
        "html": wrap_html(title, long_html),
        "go": "timeline",
    }


def classify_med_stop(title: str, detail: str, day_offset: int = 0) -> str:
    blob = f"{title} {detail}".lower()
    if "sglt" in blob or "empagliflozin" in blob or "dapagliflozin" in blob or "canagliflozin" in blob:
        return "sglt2"
    return "med7"


def payload_from_event(event: dict[str, Any], url: str) -> dict[str, str]:
    return push_payload(str(event["title"]), str(event["body"]), url)
