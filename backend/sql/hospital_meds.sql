-- Hospital medication stop windows (timeline cards, not protocol_steps).
-- Depends on: mvp.sql (hospitals).
-- Safe to re-run.
--
-- day_offset only: timeline stamps procedure_date + day_offset at 00:00
-- (same as diet-start). A later reminder send time is a new column, not this file.
--
-- protocol_steps.kind is TEXT on the live DB. Fresh installs that still have
-- event_kind should also run (after commit, before hospital_meds.seed.sql):
--   ALTER TYPE event_kind ADD VALUE IF NOT EXISTS 'prep';
--   ALTER TYPE event_kind ADD VALUE IF NOT EXISTS 'med';
-- Those labels are also added in protocol_steps.seed.sql.

CREATE TABLE IF NOT EXISTS hospital_med_stops (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  hospital_id   BIGINT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  day_offset    INT NOT NULL,               -- −7 = seven days before procedure
  title         TEXT NOT NULL,
  detail        TEXT NOT NULL DEFAULT '',
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hospital_med_stops_hospital_id_idx
  ON hospital_med_stops (hospital_id, sort_order, id);

ALTER TABLE hospital_med_stops ENABLE ROW LEVEL SECURITY;
