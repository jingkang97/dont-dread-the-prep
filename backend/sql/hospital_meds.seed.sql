-- TTSH medication stop windows. SGH / NCCS get no rows until their sheets land.
-- Depends on: mvp.seed.sql (hospitals), hospital_meds.sql (tables).
-- Safe to re-run.

UPDATE protocol_steps
SET kind = 'prep'
WHERE kind = 'dose';

INSERT INTO hospital_med_stops (hospital_id, step_key, day_offset, title, detail, sort_order)
SELECT h.id, v.step_key, v.day_offset, v.title, v.detail, v.sort_order
FROM hospitals h
CROSS JOIN (
  VALUES
  (
    'med-7',
    -7,
    'If prescribed - Stop iron, blood thinners, anti-diarrhoeals medicines',
    'Confirm against the list from counselling. If you are on these medications and unsure, ask your care team.',
    10
  ),
  (
    'med-2',
    -2,
    'If prescribed — Stop SGLT2 inhibitors',
    'Stop these diabetes mediciations empagliflozin / dapagliflozin. Still confirm against the list from counselling. If you are on these medications and unsure, ask your care team.',
    20
  )
) AS v(step_key, day_offset, title, detail, sort_order)
WHERE h.code = 'ttsh'
ON CONFLICT (hospital_id, step_key) DO UPDATE SET
  day_offset = EXCLUDED.day_offset,
  title = EXCLUDED.title,
  detail = EXCLUDED.detail,
  sort_order = EXCLUDED.sort_order;

INSERT INTO hospital_med_stop_items (stop_id, med_key, name, sort_order)
SELECT s.id, v.med_key, v.name, v.sort_order
FROM hospital_med_stops s
JOIN hospitals h ON h.id = s.hospital_id
JOIN (
  VALUES
    ('med-7', 'iron', 'iron', 10),
    ('med-7', 'plavix', 'Plavix', 20),
    ('med-7', 'anti-diarrhoeals', 'anti-diarrhoeals', 30),
    ('med-2', 'sglt2', 'SGLT2 inhibitors', 10)
) AS v(step_key, med_key, name, sort_order)
  ON s.step_key = v.step_key
WHERE h.code = 'ttsh'
ON CONFLICT (stop_id, med_key) DO UPDATE SET
  name = EXCLUDED.name,
  sort_order = EXCLUDED.sort_order;
