-- PrepPath protocol timeline templates (data-driven steps).
-- Depends on: mvp.sql (protocols).
-- Optional later: pin sessions.protocol_version_id once timelines ship in the API.

ALTER TABLE protocols
  ADD COLUMN IF NOT EXISTS source_label TEXT NOT NULL DEFAULT '';

ALTER TABLE protocols
  DROP COLUMN IF EXISTS last_meal,
  DROP COLUMN IF EXISTS last_meal_note,
  DROP COLUMN IF EXISTS fluid_stop_hours,
  DROP COLUMN IF EXISTS form_gap;

CREATE TYPE event_kind AS ENUM (
  'diet',
  'dose',
  'meal',
  'fast',
  'arrive',
  'stool'
);

-- Absolute clock on procedure calendar vs relative to reporting_time.
CREATE TYPE timing_mode AS ENUM (
  'day_clock',
  'report_relative'
);

-- 'any' = both AM and PM slots; otherwise only that slot.
CREATE TYPE step_slot AS ENUM ('any', 'am', 'pm');

CREATE TABLE protocol_versions (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  protocol_id     BIGINT NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
  -- Monotonic per protocol; latest = ORDER BY version_id DESC LIMIT 1
  version_id      INT NOT NULL CHECK (version_id > 0),
  version_label   TEXT NOT NULL,              -- e.g. 'yellow-form', '2026-03'
  effective_from  DATE,
  notes           TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (protocol_id, version_id),
  UNIQUE (protocol_id, version_label)
);

-- Supports: latest version per protocol via (protocol_id, version_id DESC)
CREATE INDEX protocol_versions_latest_idx
  ON protocol_versions (protocol_id, version_id DESC);

CREATE TABLE protocol_steps (
  id                    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  protocol_version_id   BIGINT NOT NULL REFERENCES protocol_versions(id) ON DELETE CASCADE,

  step_key              TEXT NOT NULL,        -- stable id: 'med-7', 'p1', 'fast'
  kind                  event_kind NOT NULL,
  slot                  step_slot NOT NULL DEFAULT 'any',

  timing_mode           timing_mode NOT NULL,
  day_offset            INT,                  -- day_clock: 0 = day-of, -1 = eve
  clock_time            TIME,                 -- day_clock: local wall clock
  hours_before_report   NUMERIC(4, 1),        -- report_relative: reporting_time − N hours

  title                 TEXT NOT NULL,
  detail                TEXT NOT NULL DEFAULT '',
  tentative             BOOLEAN NOT NULL DEFAULT false,
  sort_order            INT NOT NULL DEFAULT 0,

  dose_label            TEXT,                 -- '1', '2', 'Picoprep eve', …
  mix_volume_ml         INT,
  follow_fluid_ml       INT,
  agent                 TEXT,                 -- 'picoprep' | 'peg' | null
  -- Filename under frontend/public/timeline/, e.g. 'ttsh-peg-8-pack-79.png'.
  prep_image_label      TEXT,

  meta                  JSONB NOT NULL DEFAULT '{}',

  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (protocol_version_id, step_key, slot),

  CONSTRAINT protocol_steps_timing_chk CHECK (
    (
      timing_mode = 'day_clock'
      AND day_offset IS NOT NULL
      AND clock_time IS NOT NULL
      AND hours_before_report IS NULL
    )
    OR
    (
      timing_mode = 'report_relative'
      AND hours_before_report IS NOT NULL
      AND day_offset IS NULL
      AND clock_time IS NULL
    )
  )
);

CREATE INDEX protocol_steps_version_slot_idx
  ON protocol_steps (protocol_version_id, slot, sort_order);
