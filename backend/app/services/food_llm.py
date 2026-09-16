from __future__ import annotations

import json
from dataclasses import dataclass, field

from openai import OpenAI

from app.core.config import get_settings

SYSTEM_PROMPT = (
    "You help a colonoscopy-prep app understand a patient's food question. "
    "Respond ONLY with JSON matching the given schema.\n"
    "- status='irrelevant': the message is not asking about a specific food or drink item "
    "(e.g. small talk, a symptom, a medication, or a general question).\n"
    "- status='multiple': the message names more than one distinct food/drink item. Set message "
    "to ask the user to ask about one food at a time, and leave synonyms empty.\n"
    "- status='ok': the message names exactly one food/drink item. Return 3-6 short, lowercase, "
    "English synonyms or alternate spellings for that single item so it can be looked up by name "
    "(e.g. 'chickenrice' -> ['chicken rice', 'hainanese chicken rice'])."
)

RESPONSE_SCHEMA = {
    "name": "food_query_classification",
    "schema": {
        "type": "object",
        "properties": {
            "status": {"type": "string", "enum": ["ok", "multiple", "irrelevant"]},
            "message": {"type": "string"},
            "synonyms": {"type": "array", "items": {"type": "string"}},
        },
        "required": ["status", "message", "synonyms"],
        "additionalProperties": False,
    },
    "strict": True,
}


@dataclass
class FoodQueryResult:
    status: str
    message: str
    synonyms: list[str] = field(default_factory=list)


def _client() -> OpenAI:
    settings = get_settings()
    return OpenAI(base_url=settings.google_api_url, api_key=settings.google_api_key)


def identify_food_query(query: str) -> FoodQueryResult:
    """Ask the configured chat model what single food/drink item the user means.

    Raises on transport or config errors — callers decide the user-facing fallback.
    """
    settings = get_settings()
    completion = _client().chat.completions.create(
        model=settings.google_model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": query},
        ],
        response_format={"type": "json_schema", "json_schema": RESPONSE_SCHEMA},
        temperature=0,
    )
    raw = completion.choices[0].message.content or "{}"
    data = json.loads(raw)
    return FoodQueryResult(
        status=data.get("status", "irrelevant"),
        message=str(data.get("message", "")),
        synonyms=[s for s in data.get("synonyms", []) if isinstance(s, str) and s.strip()],
    )
