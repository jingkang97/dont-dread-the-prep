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
    "dose": {
        "title": "Prep dose",
        "body": "Time to mix and drink this dose.",
    },
    "peg": {
        "title": "PEG dose",
        "body": "Time to mix and drink PEG.",
    },
    "p1": {
        "title": "Picoprep packet 1",
        "body": "Time to mix and drink packet 1.",
    },
    "p2": {
        "title": "Picoprep packet 2",
        "body": "Time to mix and drink packet 2.",
    },
    "p3": {
        "title": "Picoprep packet 3",
        "body": "Time to mix and drink packet 3.",
    },
    "p4": {
        "title": "Picoprep packet 4",
        "body": "Time to mix and drink packet 4.",
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


def push_payload(key: str, url: str) -> dict[str, str]:
    item = ITEMS[key]
    return {"title": item["title"], "body": f"{item_body(item)}\n\n{tap_hint(url)}", "url": url}


def dose_html(title: str, agent: str) -> str:
    item = ITEMS["peg" if agent == "peg" else "dose"]
    return f"<b>{title}</b>\n\n{item['body']}"


def dose_push_payload(title: str, agent: str, url: str) -> dict[str, str]:
    item = ITEMS["peg" if agent == "peg" else "dose"]
    return {"title": title, "body": f"{item_body(item)}\n\n{tap_hint(url)}", "url": url}


REMINDERS = {key: telegram_html(key) for key in ITEMS}
