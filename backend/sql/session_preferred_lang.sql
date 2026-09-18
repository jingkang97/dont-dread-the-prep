-- Preferred UI language for Telegram / push reminder copy.
-- Also created on API boot (ALTER TABLE … IF NOT EXISTS).

ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS preferred_lang TEXT NOT NULL DEFAULT 'en';
