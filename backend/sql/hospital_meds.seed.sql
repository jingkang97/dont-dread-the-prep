-- TTSH / SKH medication stop windows.
-- Depends on: mvp.seed.sql (hospitals), hospital_meds.sql (tables).
-- Safe to re-run (deletes then re-inserts TTSH + SKH med stops).

UPDATE protocol_steps
SET kind = 'prep'
WHERE kind = 'dose';

DELETE FROM hospital_med_stops
WHERE hospital_id IN (SELECT id FROM hospitals WHERE code IN ('ttsh', 'skh'));

INSERT INTO hospital_med_stops (hospital_id, day_offset, title, detail, sort_order)
SELECT h.id, v.day_offset, v.title, v.detail, v.sort_order
FROM hospitals h
CROSS JOIN (
  VALUES
  (
    -7,
    'Some medicines may need to be stopped 7 days before',
    E'Some medications — blood thinners, certain supplements, and iron — may need to be stopped or adjusted up to 1 week before. Tap ? for the list.\n\nDo not stop any medication unless instructed. If unsure, contact your care team.',
    10
  ),
  (
    -2,
    'If prescribed — stop Dapagliflozin / Empagliflozin',
    'Do not take these diabetes medications for 2 days before and on the day of the procedure if you are going for colonoscopy. Confirm against the list from counselling if unsure.',
    20
  )
) AS v(day_offset, title, detail, sort_order)
WHERE h.code IN ('ttsh', 'skh');
