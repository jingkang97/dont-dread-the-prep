CREATE TYPE slot AS ENUM ('am', 'pm');
-- prep_agent is plain text so new families (e.g. peg-4l) are insert-only — no ALTER TYPE.
CREATE TYPE three_way AS ENUM ('yes', 'no', 'ask');

CREATE TABLE protocols (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name              TEXT NOT NULL UNIQUE,
  prep_agent        TEXT NOT NULL,           -- family key: 'picoprep' | 'picoprep-peg' | 'peg-2l' | 'peg-3l' | …
  prep_agent_label  TEXT NOT NULL,           -- picker chip label
  diet_days         INT NOT NULL CHECK (diet_days > 0),
  milk_in_coffee    three_way NOT NULL,
  fruit_juice       three_way NOT NULL,
  rice_cereal       three_way NOT NULL,
  coffee_tea        three_way NOT NULL,
  -- Which prep? shows listed rows only. AM/PM sheets share prep_agent; afternoon is listed=false.
  listed            BOOLEAN NOT NULL DEFAULT true,
  -- Inclusive start / exclusive end of reporting_time for this sheet. Both null = any time.
  reporting_from    TIME,
  reporting_until   TIME,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT protocols_reporting_window_chk CHECK (
    reporting_from IS NULL
    OR reporting_until IS NULL
    OR reporting_from < reporting_until
  )
);

CREATE TABLE hospitals (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code          TEXT NOT NULL UNIQUE,          -- 'sgh' | 'nccs' | 'ttsh'
  short_name    TEXT NOT NULL,
  name          TEXT NOT NULL,
  cluster       TEXT NOT NULL,
  contacts      JSONB NOT NULL DEFAULT '[]',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE hospital_protocols (
  hospital_id  BIGINT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  protocol_id  BIGINT NOT NULL REFERENCES protocols(id) ON DELETE RESTRICT,
  PRIMARY KEY (hospital_id, protocol_id)
);

CREATE INDEX hospital_protocols_protocol_id_idx ON hospital_protocols(protocol_id);
CREATE INDEX protocols_listed_agent_idx ON protocols (listed, prep_agent);
