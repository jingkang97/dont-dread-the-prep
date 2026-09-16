-- Drop unused per-drug list under med stop windows (timeline only uses hospital_med_stops).
-- Depends on: hospital_meds.sql.
-- Safe to re-run.

DROP TABLE IF EXISTS hospital_med_stop_items;
