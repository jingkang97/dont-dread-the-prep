-- Telegram chat link + reminder send receipts.
-- Depends on: sessions.sql

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS telegram_chat_id BIGINT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS reminder_t72_sent_at TIMESTAMPTZ;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS reminder_t24_sent_at TIMESTAMPTZ;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS reminder_t6_sent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS sessions_telegram_chat_idx
  ON sessions (telegram_chat_id)
  WHERE telegram_chat_id IS NOT NULL;
