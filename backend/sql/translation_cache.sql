-- UI string translations (Google NMT). Cache hits never call Google.
-- Keyed by source text + language + glossary version.

CREATE TABLE IF NOT EXISTS translation_cache (
    source_hash TEXT NOT NULL,
    lang TEXT NOT NULL,
    glossary_version TEXT NOT NULL,
    source_text TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (source_hash, lang, glossary_version)
);

CREATE INDEX IF NOT EXISTS translation_cache_lang_idx
    ON translation_cache (lang, glossary_version);
