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
        "body": "Some medications may need to stop in 1 week's time, check the instructions from your hospital.",
    },
    "med7": {
        "title": "⚠️ Check if you need to stop any medicines 7 days before",
        "body": "If your hospital told you to stop certain medications 7 days before your colonoscopy, please do so today.",
    },
    "sglt2": {
        "title": "⚠️ Check if you need to stop any medicines 2 days before",
        "body": "If your hospital told you to stop your SGLT2 inhibitor today, please do so now.",
    },
    "diet": {
        "title": "3 days before · Start low-residue diet",
        "body": "Start your low-residue diet today, as prescribed by your clinic.",
    },
    "prep_start": {
        "title": "1 day before · Start bowel preparation",
        "body": "Your colonoscopy is tomorrow. Start your bowel prep today, following your hospital's timing instructions.",
    },
    "stool": {
        "title": "During bowel preparation · Check your stool",
        "body": "Check your stool: it should look light yellow, watery and clear, like urine.",
    },
    "fast": {
        "title": "2 hours before · Stop all fluids",
        "body": "Stop drinking all fluids now, including water, as instructed by your hospital.",
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
    return _message(
        "t14",
        "14 days before · Check your medications",
        "Some medications may need to stop in 1 week's time, check the instructions from your hospital.",
    )


def med7_copy(
    hospital: str, procedure_date: date, reporting_time: time, *, days: int
) -> dict[str, str]:
    when = days_phrase(days)
    return _message(
        "med7",
        f"⚠️ Check if you need to stop any medicines {when} before",
        (
            f"If your hospital told you to stop certain medications {when} before your colonoscopy, "
            "please do so today."
        ),
        when,
    )


def sglt2_copy(
    hospital: str, procedure_date: date, reporting_time: time, *, days: int
) -> dict[str, str]:
    when = days_phrase(days)
    return _message(
        "sglt2",
        f"⚠️ Check if you need to stop any medicines {when} before",
        "If your hospital told you to stop your SGLT2 inhibitor today, please do so now.",
    )


def diet_copy(
    hospital: str, procedure_date: date, reporting_time: time, *, days: int
) -> dict[str, str]:
    when = days_phrase(days)
    return _message(
        "diet",
        f"{when} before · Start low-residue diet",
        "Start your low-residue diet today, as prescribed by your clinic.",
    )


def prep_start_copy(hospital: str, procedure_date: date, reporting_time: time) -> dict[str, str]:
    return _message(
        "prep_start",
        "1 day before · Start bowel preparation",
        "Your colonoscopy is tomorrow. Start your bowel prep today, following your hospital's timing instructions.",
    )


def stool_copy(*, hours: float = 0) -> dict[str, str]:
    return _message(
        "stool",
        "During bowel preparation · Check your stool",
        "Check your stool: it should look light yellow, watery and clear, like urine.",
        go="stool",
    )


def fast_copy(*, hours: float) -> dict[str, str]:
    when = hours_phrase(hours)
    return _message(
        "fast",
        f"{when} before · Stop all fluids",
        "Stop drinking all fluids now, including water, as instructed by your hospital.",
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
    if int(day_offset) == -2:
        return "sglt2"
    blob = f"{title} {detail}".lower()
    if "sglt" in blob or "empagliflozin" in blob or "dapagliflozin" in blob or "canagliflozin" in blob:
        return "sglt2"
    return "med7"
