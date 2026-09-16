-- TTSH medication stop windows. SGH / NCCS get no rows until their sheets land.
-- Depends on: mvp.seed.sql (hospitals), hospital_meds.sql (tables).
-- Safe to re-run (deletes then re-inserts TTSH med stops).

UPDATE protocol_steps
SET kind = 'prep'
WHERE kind = 'dose';

DELETE FROM hospital_med_stops
WHERE hospital_id = (SELECT id FROM hospitals WHERE code = 'ttsh');

INSERT INTO hospital_med_stops (hospital_id, day_offset, title, detail, sort_order)
SELECT h.id, v.day_offset, v.title, v.detail, v.sort_order
FROM hospitals h
CROSS JOIN (
  VALUES
  (
    -7,
    'If prescribed - Stop iron, blood thinners, anti-diarrhoeals medicines',
    'Confirm against the list from counselling. If you are on these medications and unsure, ask your care team.',
    10
  ),
  (
    -2,
    'If prescribed — Stop SGLT2 inhibitors',
    'Stop these diabetes mediciations empagliflozin / dapagliflozin. Still confirm against the list from counselling. If you are on these medications and unsure, ask your care team.',
    20
  )
) AS v(day_offset, title, detail, sort_order)
WHERE h.code = 'ttsh';
