CREATE TYPE slot AS ENUM ('am', 'pm');
CREATE TYPE prep_agent AS ENUM (
  'picoprep',      -- SGH/NCCS and TTSH Picoprep-only (dosing differs by protocol)
  'picoprep-peg',  -- TTSH Picoprep eve + PEG morning
  'peg'            -- PEG-only paths (e.g. future CGH)
);
CREATE TYPE three_way AS ENUM ('yes', 'no', 'ask');

CREATE TABLE protocols (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name              TEXT NOT NULL UNIQUE,  -- 'sgh-nccs-picoprep' | 'ttsh-picoprep (8am-2pm)' | 'ttsh-picoprep (2pm-5pm)' | 'ttsh-picoprep-peg (8am-2pm)'
  prep_agent        prep_agent NOT NULL,
  prep_agent_label  TEXT NOT NULL,
  diet_days         INT NOT NULL CHECK (diet_days > 0),
  milk_in_coffee    three_way NOT NULL,
  fruit_juice       three_way NOT NULL,
  rice_cereal       three_way NOT NULL,
  coffee_tea        three_way NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
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
