from __future__ import annotations

import hashlib
import html
import logging
import re
import threading
from typing import Iterable

import httpx
from sqlalchemy import bindparam, text

from app.core.config import get_settings
from app.db.session import get_engine

log = logging.getLogger(__name__)

GLOSSARY_VERSION = "2"
GOOGLE_TARGETS = {"zh": "zh-CN", "ms": "ms", "ta": "ta"}
BATCH_SIZE = 40
MAX_CHARS = 4000
API = "https://translation.googleapis.com/language/translate/v2"

# Longest first so "PEG-ES" is not split by "PEG". Hospital names are translated.
_GLOSSARY_TERMS = tuple(
    sorted(
        (
            "Home Screen",
            "PrepPath",
            "Picoprep",
            "Telegram",
            "HackitRx",
            "Bristol",
            "PEG-ES",
            "Safari",
            "Chrome",
            "iPhone",
            "Android",
            "PEG",
            "Milo",
            "Kopi",
            "Fleet",
        ),
        key=len,
        reverse=True,
    )
)
_GLOSSARY_RE = re.compile("|".join(re.escape(term) for term in _GLOSSARY_TERMS), re.I)
_PLACEHOLDER_RE = re.compile(r"\{[A-Za-z0-9_]+\}")
_BOLD_RE = re.compile(r"\*\*([^*]+)\*\*")
_SPAN_RE = re.compile(r"</?span[^>]*>", re.I)
_BOLD_HTML_RE = re.compile(r"<(?:b|strong)>(.*?)</(?:b|strong)>", re.I | re.S)

_ENSURE_SQL = """
CREATE TABLE IF NOT EXISTS translation_cache (
    source_hash TEXT NOT NULL,
    lang TEXT NOT NULL,
    glossary_version TEXT NOT NULL,
    source_text TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (source_hash, lang, glossary_version)
)
"""
_google_lock = threading.Lock()
_table_ready = False


def translation_configured() -> bool:
    return bool(get_settings().google_translate_api_key.strip())


def _hash(source: str) -> str:
    return hashlib.sha256(f"{GLOSSARY_VERSION}\n{source}".encode()).hexdigest()


def _notranslate(match: re.Match[str]) -> str:
    return f'<span class="notranslate" translate="no">{match.group(0)}</span>'


def _protect(source: str) -> str:
    text_html = html.escape(source)
    text_html = _BOLD_RE.sub(r"<b>\1</b>", text_html)
    text_html = _PLACEHOLDER_RE.sub(_notranslate, text_html)
    return _GLOSSARY_RE.sub(_notranslate, text_html)


def _unprotect(translated: str) -> str:
    text_plain = _SPAN_RE.sub("", translated)
    text_plain = _BOLD_HTML_RE.sub(r"**\1**", text_plain)
    return html.unescape(text_plain).strip()


def _ensure_table() -> None:
    global _table_ready
    if _table_ready:
        return
    with get_engine().begin() as conn:
        conn.execute(text(_ENSURE_SQL))
    _table_ready = True


def _load_cached(lang: str, sources: list[str]) -> dict[str, str]:
    if not sources:
        return {}
    hashes = [_hash(s) for s in sources]
    stmt = text(
        """
        SELECT source_text, translated_text
        FROM translation_cache
        WHERE lang = :lang
          AND glossary_version = :ver
          AND source_hash IN :hashes
        """
    ).bindparams(bindparam("hashes", expanding=True))
    with get_engine().connect() as conn:
        rows = conn.execute(stmt, {"lang": lang, "ver": GLOSSARY_VERSION, "hashes": hashes})
        return {str(r.source_text): str(r.translated_text) for r in rows}


def _store(lang: str, pairs: list[tuple[str, str]]) -> None:
    if not pairs:
        return
    stmt = text(
        """
        INSERT INTO translation_cache
            (source_hash, lang, glossary_version, source_text, translated_text)
        VALUES (:h, :lang, :ver, :src, :dst)
        ON CONFLICT (source_hash, lang, glossary_version)
        DO UPDATE SET translated_text = EXCLUDED.translated_text
        """
    )
    payload = [
        {
            "h": _hash(source),
            "lang": lang,
            "ver": GLOSSARY_VERSION,
            "src": source,
            "dst": translated,
        }
        for source, translated in pairs
    ]
    with get_engine().begin() as conn:
        conn.execute(stmt, payload)


def _chunks(items: list[str]) -> Iterable[list[str]]:
    batch: list[str] = []
    chars = 0
    for item in items:
        extra = len(item)
        if batch and (len(batch) >= BATCH_SIZE or chars + extra > MAX_CHARS):
            yield batch
            batch = []
            chars = 0
        batch.append(item)
        chars += extra
    if batch:
        yield batch


def _google_translate(lang: str, sources: list[str]) -> dict[str, str]:
    key = get_settings().google_translate_api_key.strip()
    if not key or not sources:
        return {}
    target = GOOGLE_TARGETS[lang]
    out: dict[str, str] = {}
    billed = 0
    with _google_lock:
        with httpx.Client(timeout=30) as client:
            for chunk in _chunks(sources):
                protected = [_protect(s) for s in chunk]
                billed += sum(len(p) for p in protected)
                response = client.post(
                    API,
                    params={"key": key},
                    json={
                        "q": protected,
                        "source": "en",
                        "target": target,
                        "format": "html",
                    },
                )
                if response.status_code != 200:
                    log.warning(
                        "Google Translate %s failed (%s): %s",
                        lang,
                        response.status_code,
                        response.text[:240],
                    )
                    continue
                data = response.json()
                translations = data.get("data", {}).get("translations") or []
                if len(translations) != len(chunk):
                    log.warning("Google Translate %s returned %s for %s strings", lang, len(translations), len(chunk))
                    continue
                for source, row in zip(chunk, translations, strict=True):
                    translated = _unprotect(str(row.get("translatedText") or ""))
                    if translated:
                        out[source] = translated
    if billed:
        log.warning("Google Translate billed ~%s input chars -> %s (%s strings)", billed, lang, len(out))
    return out


def translate_catalog(lang: str, items: list[tuple[str, str]]) -> dict[str, str]:
    """Return key -> translated text for cache/Google hits only. Misses stay English in the UI."""
    if lang not in GOOGLE_TARGETS:
        return {}
    unique_sources = list(dict.fromkeys(value for _, value in items if value.strip()))
    try:
        _ensure_table()
        cached = _load_cached(lang, unique_sources)
    except Exception:
        log.exception("translation cache unavailable")
        return {}
    missing = [s for s in unique_sources if s not in cached]
    if missing and translation_configured():
        try:
            fresh = _google_translate(lang, missing)
        except Exception:
            log.exception("Google Translate request failed for %s", lang)
            fresh = {}
        if fresh:
            try:
                _store(lang, list(fresh.items()))
            except Exception:
                log.exception("translation cache write failed")
            cached.update(fresh)
    return {key: cached[source] for key, source in items if source in cached}
