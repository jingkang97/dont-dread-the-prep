-- Make protocols picker/remap data-driven.
-- Depends on: mvp.sql (protocols). Safe to re-run.
--
-- - prep_agent: enum → TEXT (new families without ALTER TYPE)
-- - listed: show on "Which prep?"
-- - reporting_from / reporting_until: sheet chosen from reporting_time
--   (from inclusive, until exclusive; both null = any time)

-- ---------------------------------------------------------------------------
-- Columns
-- ---------------------------------------------------------------------------
ALTER TABLE protocols
  ADD COLUMN IF NOT EXISTS listed BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE protocols
  ADD COLUMN IF NOT EXISTS reporting_from TIME;

ALTER TABLE protocols
  ADD COLUMN IF NOT EXISTS reporting_until TIME;

-- Convert prep_agent enum → text when still an enum.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'protocols'
      AND column_name = 'prep_agent'
      AND udt_name = 'prep_agent'
  ) THEN
    ALTER TABLE protocols
      ALTER COLUMN prep_agent TYPE TEXT USING prep_agent::text;
  END IF;
END $$;

-- Drop unused enum type if nothing references it.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'prep_agent')
     AND NOT EXISTS (
       SELECT 1
       FROM pg_attribute a
       JOIN pg_class c ON c.oid = a.attrelid
       JOIN pg_type t ON t.oid = a.atttypid
       WHERE t.typname = 'prep_agent' AND NOT a.attisdropped
     ) THEN
    DROP TYPE prep_agent;
  END IF;
END $$;

ALTER TABLE protocols DROP CONSTRAINT IF EXISTS protocols_reporting_window_chk;
ALTER TABLE protocols
  ADD CONSTRAINT protocols_reporting_window_chk CHECK (
    reporting_from IS NULL
    OR reporting_until IS NULL
    OR reporting_from < reporting_until
  );

CREATE INDEX IF NOT EXISTS protocols_listed_agent_idx
  ON protocols (listed, prep_agent);

-- ---------------------------------------------------------------------------
-- Seed windows + listed flags (existing rows)
-- ---------------------------------------------------------------------------
UPDATE protocols SET
  listed = true,
  reporting_from = NULL,
  reporting_until = NULL
WHERE name = 'sgh-nccs-picoprep';

UPDATE protocols SET
  listed = true,
  reporting_from = NULL,
  reporting_until = TIME '14:00'
WHERE name = 'ttsh-picoprep (8am-2pm)';

UPDATE protocols SET
  listed = false,
  reporting_from = TIME '14:00',
  reporting_until = NULL
WHERE name = 'ttsh-picoprep (2pm-5pm)';

UPDATE protocols SET
  listed = true,
  reporting_from = NULL,
  reporting_until = TIME '14:00'
WHERE name = 'ttsh-picoprep-peg (8am-2pm)';

UPDATE protocols SET
  listed = false,
  reporting_from = TIME '14:00',
  reporting_until = NULL
WHERE name = 'ttsh-picoprep-peg (2pm-5pm)';

UPDATE protocols SET
  listed = true,
  reporting_from = NULL,
  reporting_until = TIME '14:00'
WHERE name = 'ttsh-peg-2l (8am-2pm)';

UPDATE protocols SET
  listed = true,
  reporting_from = NULL,
  reporting_until = TIME '14:00'
WHERE name = 'ttsh-peg-3l (8am-2pm)';
