from __future__ import annotations

from typing import TypedDict


class ReminderCopy(TypedDict, total=False):
    title: str
    body: str
    extra: str


ITEMS: dict[str, ReminderCopy] = {
    "t72": {
        "title": "T−72 hours",
        "body": "Low-residue diet should already be underway.",
    },
    "t24": {
        "title": "T−24 hours",
        "body": "Eve of scope. Last meal and first Picoprep doses are close.",
    },
    "t6": {
        "title": "T−6 hours",
        "body": "Final doses and fasting cutoff. Check stool colour before you leave.",
        "extra": (
            "Stages 1–4: not ready — call your hospital or report 2 hours early.\n"
            "Stage 5: almost. Stage 6: ready."
        ),
    },
}


def telegram_html(key: str) -> str:
    item = ITEMS[key]
    text = f"<b>{item['title']}</b>\n\n{item['body']}"
    extra = item.get("extra")
    if extra:
        text += f"\n\n{extra}"
    return text


def push_payload(key: str, url: str) -> dict[str, str]:
    item = ITEMS[key]
    body = item["body"]
    extra = item.get("extra")
    if extra:
        body = f"{body}\n\n{extra}"
    return {"title": item["title"], "body": body, "url": url}


REMINDERS = {key: telegram_html(key) for key in ITEMS}
