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

GLOSSARY_VERSION = "5"
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
# Short English that NMT maps to the wrong sense (stool=bench, home=house).
# Longest first; restored after Google with the language's medical/UI wording.
_SENSE_TERMS = (
    "stool scale",
    "stool check",
    "stool colour",
    "stool color",
    "stool guide",
    "stools",
    "stool",
    "home",
)
_SENSE_OUT = {
    "stool scale": {"zh": "粪便量表", "ms": "skala najis", "ta": "மல அளவுகோல்"},
    "stool check": {"zh": "粪便检查", "ms": "semakan najis", "ta": "மலப் பரிசோதனை"},
    "stool colour": {"zh": "粪便颜色", "ms": "warna najis", "ta": "மல நிறம்"},
    "stool color": {"zh": "粪便颜色", "ms": "warna najis", "ta": "மல நிறம்"},
    "stool guide": {"zh": "粪便指南", "ms": "panduan najis", "ta": "மல வழிகாட்டி"},
    "stools": {"zh": "粪便", "ms": "najis", "ta": "மலம்"},
    "stool": {"zh": "粪便", "ms": "najis", "ta": "மலம்"},
    "home": {"zh": "首页", "ms": "laman utama", "ta": "முகப்பு"},
}
_EN_MONTHS = {
    "jan": 1,
    "january": 1,
    "feb": 2,
    "february": 2,
    "mar": 3,
    "march": 3,
    "apr": 4,
    "april": 4,
    "may": 5,
    "jun": 6,
    "june": 6,
    "jul": 7,
    "july": 7,
    "aug": 8,
    "august": 8,
    "sep": 9,
    "sept": 9,
    "september": 9,
    "oct": 10,
    "october": 10,
    "nov": 11,
    "november": 11,
    "dec": 12,
    "december": 12,
}
_GLOSSARY_RE = re.compile("|".join(re.escape(term) for term in _GLOSSARY_TERMS), re.I)
_SENSE_RE = re.compile("|".join(rf"(?<![A-Za-z]){re.escape(term)}(?![A-Za-z])" for term in _SENSE_TERMS), re.I)
_SENSE_TOKEN_RE = re.compile(r"__PP_([a-z_]+)__", re.I)
_DATE_TOKEN_RE = re.compile(
    r"__PPDATE_(\d{1,2})_(\d{1,2})(?:_(\d{4}))?(?:_(\d{1,2})_(\d{2})_([AP]M))?__",
    re.I,
)
_EN_DATE_RE = re.compile(
    r"\b(\d{1,2})\s+"
    r"(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|"
    r"Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?"
    r"(?:\s+(\d{4}))?"
    r"(?:,\s+(\d{1,2}):(\d{2})\s*([AaPp][Mm]))?",
    re.I,
)
_SPAN_SPLIT_RE = re.compile(r"(<span\b[^>]*>.*?</span>)", re.I | re.S)
_PLACEHOLDER_RE = re.compile(r"\{[A-Za-z0-9_]+\}")
_BOLD_RE = re.compile(r"\*\*([^*]+)\*\*")
_SPAN_RE = re.compile(r"</?span[^>]*>", re.I)
_BOLD_HTML_RE = re.compile(r"<(?:b|strong)>(.*?)</(?:b|strong)>", re.I | re.S)
_BENCH_RE = re.compile(r"凳子|长凳|板凳")

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


def _wrap_notranslate(inner: str) -> str:
    return f'<span class="notranslate" translate="no">{inner}</span>'


def _sense_token(term: str) -> str:
    return f"__PP_{term.lower().replace(' ', '_')}__"


def _date_token(match: re.Match[str]) -> str:
    month = _EN_MONTHS.get(match.group(2).lower().rstrip("."))
    if not month:
        return match.group(0)
    day = int(match.group(1))
    year = match.group(3)
    hour, minute, ampm = match.group(4), match.group(5), match.group(6)
    token = f"__PPDATE_{day}_{month}"
    if year:
        token += f"_{year}"
    if hour and minute and ampm:
        token += f"_{int(hour)}_{minute}_{ampm.upper()}"
    return token + "__"


def _map_outside_spans(text_html: str, transform) -> str:
    parts = _SPAN_SPLIT_RE.split(text_html)
    out: list[str] = []
    for part in parts:
        if part.lower().startswith("<span"):
            out.append(part)
        else:
            out.append(transform(part))
    return "".join(out)


def _protect(source: str) -> str:
    text_html = html.escape(source)
    text_html = _BOLD_RE.sub(r"<b>\1</b>", text_html)
    text_html = _PLACEHOLDER_RE.sub(_notranslate, text_html)
    text_html = _GLOSSARY_RE.sub(_notranslate, text_html)
    text_html = _map_outside_spans(
        text_html,
        lambda part: _EN_DATE_RE.sub(lambda m: _wrap_notranslate(_date_token(m)), part),
    )
    return _map_outside_spans(
        text_html,
        lambda part: _SENSE_RE.sub(
            lambda m: _wrap_notranslate(_sense_token(m.group(0))),
            part,
        ),
    )


def _zh_date(day: int, month: int, year: str | None, hour: str | None, minute: str | None, ampm: str | None) -> str:
    date_part = f"{month}月 {day} 日"
    if year:
        date_part = f"{year}年 {date_part}"
    if hour and minute and ampm:
        period = "下午" if ampm == "PM" else "上午"
        return f"{date_part} {period} {int(hour)}:{minute}"
    return date_part


def _apply_sense(translated: str, lang: str) -> str:
    def sense_repl(match: re.Match[str]) -> str:
        key = match.group(1).lower().replace("_", " ")
        return (_SENSE_OUT.get(key) or {}).get(lang) or key

    def date_repl(match: re.Match[str]) -> str:
        day, month = int(match.group(1)), int(match.group(2))
        year, hour, minute, ampm = match.group(3), match.group(4), match.group(5), match.group(6)
        if lang == "zh":
            return _zh_date(day, month, year, hour, minute, ampm.upper() if ampm else None)
        month_name = (
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        )[month - 1]
        date_part = f"{day} {month_name}"
        if year:
            date_part = f"{date_part} {year}"
        if hour and minute and ampm:
            return f"{date_part}, {int(hour)}:{minute} {ampm}"
        return date_part

    text_plain = _SENSE_TOKEN_RE.sub(sense_repl, translated)
    return _DATE_TOKEN_RE.sub(date_repl, text_plain)


def _fix_known_mistranslations(source: str, translated: str, lang: str) -> str:
    if lang == "zh" and re.search(r"\bstools?\b", source, re.I):
        translated = _BENCH_RE.sub("粪便", translated)
    if lang == "zh" and source.strip().lower() == "home" and translated.strip() in {"家", "家里", "家庭", "住宅"}:
        translated = "首页"
    return translated


def _unprotect(translated: str, lang: str, source: str) -> str:
    # Google sometimes entity-encodes our notranslate spans; unescape first so they strip.
    text_plain = html.unescape(translated)
    text_plain = _SPAN_RE.sub("", text_plain)
    text_plain = _BOLD_HTML_RE.sub(r"**\1**", text_plain)
    text_plain = re.sub(r"<[^>]+>", "", text_plain)
    text_plain = html.unescape(text_plain).strip()
    text_plain = _apply_sense(text_plain, lang)
    return _fix_known_mistranslations(source, text_plain, lang)


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
                    translated = _unprotect(str(row.get("translatedText") or ""), lang, source)
                    if translated:
                        out[source] = translated
    if billed:
        log.warning("Google Translate billed ~%s input chars -> %s (%s strings)", billed, lang, len(out))
    return out


def _exact_override(source: str, lang: str) -> str | None:
    return (_SENSE_OUT.get(source.strip().lower()) or {}).get(lang)


def translate_catalog(lang: str, items: list[tuple[str, str]]) -> dict[str, str]:
    """Return key -> translated text for cache/Google hits only. Misses stay English in the UI."""
    if lang not in GOOGLE_TARGETS:
        return {}
    unique_sources = list(dict.fromkeys(value for _, value in items if value.strip()))
    overrides = {source: text for source in unique_sources if (text := _exact_override(source, lang))}
    try:
        _ensure_table()
        cached = _load_cached(lang, unique_sources)
    except Exception:
        log.exception("translation cache unavailable")
        return {key: overrides[source] for key, source in items if source in overrides}
    cached.update(overrides)
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
    cached.update(overrides)
    return {
        key: _fix_known_mistranslations(source, _apply_sense(cached[source], lang), lang)
        for key, source in items
        if source in cached
    }


def translate_texts(lang: str, sources: list[str]) -> list[str]:
    """Translate plain strings in order. Misses and English stay as given."""
    if lang not in GOOGLE_TARGETS:
        return list(sources)
    found = translate_catalog(lang, [(str(i), text) for i, text in enumerate(sources)])
    return [found.get(str(i), text) for i, text in enumerate(sources)]
