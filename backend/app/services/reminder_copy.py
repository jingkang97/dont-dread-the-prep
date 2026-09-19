from __future__ import annotations

import html
import re
from datetime import date, time
from typing import Any, TypedDict

from app.services.translations import translate_texts


class ReminderCopy(TypedDict, total=False):
    title: str
    body: str
    extra: str


# Fallback labels for older clients.
ITEMS: dict[str, ReminderCopy] = {
    "t14": {
        "title": "14 days before · Check your medications",
        "body": "Your colonoscopy is on your appointment date. There may be some medications that you need to stop in 1 week's time. Please check the instructions given by your hospital.",
    },
    "med7": {
        "title": "7 days before · Stop certain medications",
        "body": "Your colonoscopy is on your appointment date. If you were instructed to stop certain medications 7 days before your colonoscopy, please stop them today. Please follow the instructions given by your hospital.",
    },
    "sglt2": {
        "title": "Stop SGLT2 inhibitors",
        "body": "Your colonoscopy is on your appointment date. If you were instructed to stop your SGLT2 inhibitor before your colonoscopy, please stop it today. Please follow the instructions given by your hospital.",
    },
    "diet": {
        "title": "3 days before · Start low-residue diet",
        "body": "Your colonoscopy is on your appointment date. Please start your low-residue diet today, as prescribed by your clinic. Please follow the dietary instructions given by your hospital.",
    },
    "prep_start": {
        "title": "1 day before · Start bowel preparation",
        "body": "Your colonoscopy is tomorrow. Please start your bowel preparation today and take your prescribed bowel preparation solution at the instructed time. Please follow the instructions given by your hospital.",
    },
    "stool": {
        "title": "During bowel preparation · Check your stool",
        "body": "As you complete your bowel preparation, check your stool. Your stool should become light yellow, watery and clear, like urine, with little or no solid material.",
    },
    "fast": {
        "title": "2 hours before · Stop all fluids",
        "body": "Your colonoscopy is in 2 hours. Please stop drinking all fluids now, including water. Please follow the instructions given by your hospital.",
    },
    "dose": {
        "title": "Prep dose",
        "body": "Time to mix and drink this dose.",
    },
    "dose_soon": {
        "title": "1 hour until · Prep dose",
        "body": "Your prep is due in 1 hour time.",
    },
    "peg": {
        "title": "PEG dose",
        "body": "Time to mix and drink this dose.",
    },
    "peg_soon": {
        "title": "1 hour until · PEG dose",
        "body": "Your prep is due in 1 hour time.",
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


def _html_to_plain(value: str) -> str:
    text = re.sub(r"<br\s*/?>", "\n", value, flags=re.I)
    text = re.sub(r"</p>", "\n", text, flags=re.I)
    text = re.sub(r"<[^>]+>", "", text)
    return html.unescape(text).strip()


def localize_event(event: dict[str, Any], lang: str) -> dict[str, Any]:
    if not lang or lang == "en":
        return event
    title = str(event.get("title") or "")
    body = str(event.get("body") or "")
    html_msg = str(event.get("html") or "")
    inner = ""
    marker = "</b>\n\n"
    if html_msg and marker in html_msg:
        inner = _html_to_plain(html_msg.split(marker, 1)[1])
    sources = [title, body]
    if inner and inner != body:
        sources.append(inner)
    out = translate_texts(lang, sources)
    t_title = out[0] or title
    t_body = out[1] or body
    t_inner = out[2] if len(out) > 2 else t_body
    return {
        **event,
        "title": t_title,
        "body": t_body,
        "html": wrap_html(t_title, html.escape(t_inner)),
    }


def payload_from_event(event: dict[str, Any], url: str, lang: str = "en") -> dict[str, str]:
    localized = localize_event(event, lang)
    hint = tap_hint(url)
    if lang and lang != "en":
        hint = translate_texts(lang, [hint])[0]
    return push_payload(str(localized["title"]), str(localized["body"]), url, hint)


def push_payload(title: str, body: str, url: str, hint: str | None = None) -> dict[str, str]:
    extra = hint if hint is not None else tap_hint(url)
    return {"title": title, "body": f"{body}\n\n{extra}", "url": url}


def wrap_html(title: str, long_html: str) -> str:
    return f"<b>{html.escape(title)}</b>\n\n{long_html}"


REMINDERS = {key: telegram_html(key) for key in ITEMS}


def _esc(value: str) -> str:
    return html.escape(value)


def fmt_date(value: date) -> str:
    return value.strftime("%d %b %Y").lstrip("0").replace(" 0", " ")


def days_phrase(n: int) -> str:
    n = abs(int(n))
    return "1 day" if n == 1 else f"{n} days"


def hours_phrase(hours: float) -> str:
    if abs(hours - round(hours)) < 0.05:
        n = int(round(hours))
        return "1 hour" if n == 1 else f"{n} hours"
    text = f"{hours:.1f}".rstrip("0").rstrip(".")
    return f"{text} hours"


def _message(copy_key: str, title: str, body: str, *bold: str, go: str = "timeline") -> dict[str, str]:
    html_body = _esc(body)
    for piece in bold:
        if not piece:
            continue
        token = _esc(piece)
        html_body = html_body.replace(token, f"<b>{token}</b>", 1)
    return {
        "copy_key": copy_key,
        "title": title,
        "body": body,
        "html": wrap_html(title, html_body),
        "go": go,
    }


def t14_copy(hospital: str, procedure_date: date, reporting_time: time) -> dict[str, str]:
    stamp = fmt_date(procedure_date)
    return _message(
        "t14",
        "14 days before · Check your medications",
        (
            f"Your colonoscopy is on {stamp}. There may be some medications "
            "that you need to stop in 1 week's time. Please check the instructions given by your hospital."
        ),
        stamp,
    )


def med7_copy(
    hospital: str, procedure_date: date, reporting_time: time, *, days: int
) -> dict[str, str]:
    stamp = fmt_date(procedure_date)
    when = days_phrase(days)
    return _message(
        "med7",
        f"{when} before · Stop certain medications",
        (
            f"Your colonoscopy is on {stamp}. If you were instructed to stop certain medications "
            f"{when} before your colonoscopy, please stop them today. Please follow the instructions given by your hospital."
        ),
        stamp,
        when,
    )


def sglt2_copy(
    hospital: str, procedure_date: date, reporting_time: time, *, days: int
) -> dict[str, str]:
    stamp = fmt_date(procedure_date)
    when = days_phrase(days)
    return _message(
        "sglt2",
        f"{when} before · Stop SGLT2 inhibitors",
        (
            f"Your colonoscopy is on {stamp}. If you were instructed to stop your SGLT2 inhibitor "
            f"{when} before your colonoscopy, please stop it today. Please follow the instructions given by your hospital."
        ),
        stamp,
        when,
    )


def diet_copy(
    hospital: str, procedure_date: date, reporting_time: time, *, days: int
) -> dict[str, str]:
    stamp = fmt_date(procedure_date)
    when = days_phrase(days)
    return _message(
        "diet",
        f"{when} before · Start low-residue diet",
        (
            f"Your colonoscopy is on {stamp}. Please start your low-residue diet today, as prescribed "
            "by your clinic. Please follow the dietary instructions given by your hospital."
        ),
        stamp,
    )


def prep_start_copy(hospital: str, procedure_date: date, reporting_time: time) -> dict[str, str]:
    stamp = fmt_date(procedure_date)
    return _message(
        "prep_start",
        "1 day before · Start bowel preparation",
        (
            f"Your colonoscopy is tomorrow, {stamp}. Please start your bowel preparation today and "
            "take your prescribed bowel preparation solution at the instructed time. Please follow the "
            "instructions given by your hospital."
        ),
        stamp,
    )


def stool_copy(*, hours: float = 0) -> dict[str, str]:
    return _message(
        "stool",
        "During bowel preparation · Check your stool",
        (
            "As you complete your bowel preparation, check your stool. Your stool should become light yellow, "
            "watery and clear, like urine, with little or no solid material."
        ),
        go="stool",
    )


def fast_copy(*, hours: float) -> dict[str, str]:
    when = hours_phrase(hours)
    return _message(
        "fast",
        f"{when} before · Stop all fluids",
        (
            f"Your colonoscopy is in {when}. Please stop drinking all fluids now, including water. "
            "Please follow the instructions given by your hospital."
        ),
        when,
    )


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


def dose_soon_copy(title: str, *, agent: str) -> dict[str, str]:
    copy_key = "peg_soon" if agent == "peg" else "dose_soon"
    return _message(
        copy_key,
        f"1 hour until · {title}",
        "Your prep is due in 1 hour time.",
    )


def classify_med_stop(title: str, detail: str, day_offset: int = 0) -> str:
    blob = f"{title} {detail}".lower()
    if "sglt" in blob or "empagliflozin" in blob or "dapagliflozin" in blob or "canagliflozin" in blob:
        return "sglt2"
    return "med7"
