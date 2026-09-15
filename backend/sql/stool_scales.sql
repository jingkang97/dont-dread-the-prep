-- Hospital stool colour/type scales (booklet wording per stage).
-- Depends on: mvp.sql (hospitals).
-- Safe to re-run.
--
-- hospitals.stool_scale_id NULL = no booklet chart; the API fills in the
-- seeded Bristol row. Do not store the scale as JSONB — stages are typed
-- records (n, name, look, ready), same reason protocol_steps are rows.

CREATE TABLE IF NOT EXISTS stool_scales (
  id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  key                 TEXT NOT NULL UNIQUE,   -- 'bristol' | 'ttsh-6'
  show_ready_badges   BOOLEAN NOT NULL DEFAULT true,
  not_ready_action    TEXT,                   -- NULL = frontend generic “if unsure” line
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stool_scale_stages (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  scale_id     BIGINT NOT NULL REFERENCES stool_scales(id) ON DELETE CASCADE,
  n            INT NOT NULL CHECK (n > 0),
  name         TEXT NOT NULL,                 -- 'Stool 1' / 'Type 1'
  look         TEXT NOT NULL,                 -- 'Dark brownish and solid'
  ready        TEXT CHECK (ready IN ('not', 'almost', 'ready')),  -- NULL for Bristol
  color        TEXT,                          -- cup fill when there is no photo
  photo        TEXT,                          -- optional stage thumbnail filename
  UNIQUE (scale_id, n)
);

ALTER TABLE stool_scales DROP COLUMN IF EXISTS chart_image;
ALTER TABLE stool_scales ADD COLUMN IF NOT EXISTS not_ready_action TEXT;

ALTER TABLE hospitals
  ADD COLUMN IF NOT EXISTS stool_scale_id BIGINT REFERENCES stool_scales(id);

ALTER TABLE hospitals DROP COLUMN IF EXISTS stool_not_ready_action;

CREATE INDEX IF NOT EXISTS hospitals_stool_scale_id_idx
  ON hospitals (stool_scale_id);

ALTER TABLE stool_scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE stool_scale_stages ENABLE ROW LEVEL SECURITY;
