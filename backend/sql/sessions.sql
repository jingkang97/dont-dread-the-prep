-- PrepPath patient sessions (hospital → date → AM/PM).
-- Depends on: mvp.sql enums + hospitals / protocols / hospital_protocols.
-- ruleset_version_id is deferred until ruleset_versions exists.

CREATE TABLE sessions (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  public_code     TEXT NOT NULL UNIQUE,          -- 4-char patient-facing id (Telegram / share)
  hospital_id     BIGINT NOT NULL REFERENCES hospitals(id),
  protocol_id     BIGINT NOT NULL REFERENCES protocols(id),
  procedure_date  DATE NOT NULL,
  slot            slot NOT NULL,
  reporting_time  TIME NOT NULL,
  first_name      TEXT,
  wa_opt_in       BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT sessions_hospital_protocol_fk
    FOREIGN KEY (hospital_id, protocol_id)
    REFERENCES hospital_protocols (hospital_id, protocol_id)
);

CREATE INDEX sessions_hospital_created_idx ON sessions(hospital_id, created_at DESC);
CREATE INDEX sessions_protocol_id_idx ON sessions(protocol_id);
CREATE INDEX sessions_procedure_date_idx ON sessions(procedure_date);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
