from __future__ import annotations

from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.translations import GLOSSARY_VERSION, translate_catalog, translation_configured

router = APIRouter(tags=["translations"])

Lang = Literal["zh", "ms", "ta"]


class TranslationItem(BaseModel):
    key: str = Field(..., min_length=1, max_length=80)
    text: str = Field(..., max_length=5000)


class TranslationIn(BaseModel):
    lang: Lang
    items: list[TranslationItem] = Field(..., max_length=800)


class TranslationOut(BaseModel):
    lang: str
    configured: bool
    glossary: str
    strings: dict[str, str]


@router.post("/translations", response_model=TranslationOut)
def post_translations(body: TranslationIn) -> TranslationOut:
    configured = translation_configured()
    if not configured:
        return TranslationOut(
            lang=body.lang,
            configured=False,
            glossary=GLOSSARY_VERSION,
            strings={},
        )
    pairs = [(item.key, item.text) for item in body.items]
    return TranslationOut(
        lang=body.lang,
        configured=True,
        glossary=GLOSSARY_VERSION,
        strings=translate_catalog(body.lang, pairs),
    )
