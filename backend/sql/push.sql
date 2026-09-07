-- Web Push subscription on a prep session.
-- Depends on: sessions.sql

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS push_endpoint TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS push_p256dh TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS push_auth TEXT;

CREATE INDEX IF NOT EXISTS sessions_push_endpoint_idx
    ON sessions (push_endpoint)
    WHERE push_endpoint IS NOT NULL;
