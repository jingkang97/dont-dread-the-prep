-- Timeline step seeds for SGH/NCCS Picoprep and TTSH Picoprep (± PEG).
-- Depends on: mvp.sql, mvp.seed.sql, protocol_steps.sql.
--
-- Resolver: load steps where slot IN ('any', session.slot), then:
--   day_clock       → procedure_date + day_offset @ clock_time
--   report_relative → reporting_time − hours_before_report
-- TTSH Picoprep-only: reporting_time >= 14:00 → 'ttsh-picoprep (2pm-5pm)', else 8am–2pm.

-- Safe if event_kind was created before 'check' existed; no-op on a fresh install.
ALTER TYPE event_kind ADD VALUE IF NOT EXISTS 'stool';

-- ---------------------------------------------------------------------------
-- Protocol metadata extras
-- ---------------------------------------------------------------------------
UPDATE protocols SET source_label = 'SGH/NCCS yellow form'
WHERE name = 'sgh-nccs-picoprep';

UPDATE protocols SET
  source_label = 'Preparing-for-a-Colonoscopy-ICOPREP-8AM-to-2PM',
  prep_agent_label = 'Picoprep'
WHERE name = 'ttsh-picoprep (8am-2pm)';

UPDATE protocols SET
  source_label = 'Preparing-for-a-Colonoscopy-ICOPREP-2PM-to-5PM',
  prep_agent_label = 'Picoprep'
WHERE name = 'ttsh-picoprep (2pm-5pm)';

UPDATE protocols SET
  source_label = 'Preparing-for-a-Colonoscopy-ICOPREP-8AM-to-2PM',
  prep_agent_label = 'Picoprep + PEG'
WHERE name = 'ttsh-picoprep-peg (8am-2pm)';

-- ---------------------------------------------------------------------------
-- Versions
-- ---------------------------------------------------------------------------
INSERT INTO protocol_versions (protocol_id, version_id, version_label, effective_from, notes)
VALUES
(
  (SELECT id FROM protocols WHERE name = 'sgh-nccs-picoprep'),
  1,
  'yellow-form',
  DATE '2026-01-01',
  'SGH/NCCS yellow dietary advice & Picoprep form. Afternoon packet times are not printed (F10).'
),
(
  (SELECT id FROM protocols WHERE name = 'ttsh-picoprep (8am-2pm)'),
  1,
  '2026-03',
  DATE '2026-03-01',
  'TTSH Picoprep-only · 8am–2pm sheet. Both sachets the day before (2–3pm and 8–9pm).'
),
(
  (SELECT id FROM protocols WHERE name = 'ttsh-picoprep (2pm-5pm)'),
  1,
  '2026-03',
  DATE '2026-03-01',
  'TTSH Picoprep-only · 2pm–5pm sheet. Eve sachet 8–9pm; morning sachet 7–8am after light breakfast.'
),
(
  (SELECT id FROM protocols WHERE name = 'ttsh-picoprep-peg (8am-2pm)'),
  1,
  '2026-03',
  DATE '2026-03-01',
  'TTSH Picoprep eve + PEG morning · brochure pages 5–6.'
);

-- ---------------------------------------------------------------------------
-- SGH / NCCS Picoprep · 4 sachets
-- ---------------------------------------------------------------------------
INSERT INTO protocol_steps (
  protocol_version_id, step_key, kind, slot, timing_mode,
  day_offset, clock_time, hours_before_report,
  title, detail, tentative, sort_order,
  dose_label, mix_volume_ml, follow_fluid_ml, agent
)
SELECT
  v.id,
  s.step_key, s.kind::event_kind, s.slot::step_slot, s.timing_mode::timing_mode,
  s.day_offset, s.clock_time::time, s.hours_before_report,
  s.title, s.detail, s.tentative, s.sort_order,
  s.dose_label, s.mix_volume_ml, s.follow_fluid_ml, s.agent
FROM protocol_versions v
JOIN protocols p ON p.id = v.protocol_id
CROSS JOIN (
  VALUES
  -- shared
  ('diet-start', 'diet', 'any', 'day_clock', -3, '00:00', NULL,
   'Start low-residue diet (3 days)',
   'Follow the SGH/NCCS diet list until the last meal before your procedure.',
   false, 30, NULL, NULL, NULL, NULL),
  ('last-meal-eve', 'meal', 'any', 'day_clock', -1, '19:00', NULL,
   'Last meal',
   'No food after dinner on the eve of scope.',
   false, 40, NULL, NULL, NULL, NULL),
  ('p1', 'dose', 'any', 'day_clock', -1, '18:00', NULL,
   'Picoprep packet 1',
   'Mix 1 packet with 150ml water, then drink 1L clear fluid.',
   false, 50, '1', 150, 1000, 'picoprep'),
  ('p2', 'dose', 'any', 'day_clock', -1, '21:00', NULL,
   'Picoprep packet 2',
   'Mix 1 packet with 150ml water, then drink 1L clear fluid.',
   false, 60, '2', 150, 1000, 'picoprep'),

  -- AM slot
  ('p3', 'dose', 'am', 'day_clock', 0, '04:30', NULL,
   'Picoprep packet 3 (before 6am)',
   'Mix 1 packet with 150ml water, then drink 1L clear fluid.',
   false, 70, '3', 150, 1000, 'picoprep'),
  ('p4', 'dose', 'am', 'day_clock', 0, '05:30', NULL,
   'Picoprep packet 4 (before 6am)',
   'Mix 1 packet with 150ml water, then drink 1L clear fluid.',
   false, 80, '4', 150, 1000, 'picoprep'),
  ('breakfast-am', 'meal', 'am', 'day_clock', 0, '06:00', NULL,
   'Light breakfast (then stop food)',
   '2 plain white bread or 2 plain biscuits only, then no more food.',
   false, 90, NULL, NULL, NULL, NULL),

  -- PM slot (afternoon times not printed — marked tentative)
  ('breakfast-pm', 'meal', 'pm', 'day_clock', 0, '07:00', NULL,
   'Light breakfast (afternoon slot — confirm)',
   'Afternoon packet times are not printed on the yellow form. Confirm handwritten times at counselling.',
   true, 70, NULL, NULL, NULL, NULL),
  ('p3-pm', 'dose', 'pm', 'day_clock', 0, '08:00', NULL,
   'Picoprep packet 3 (handwritten / confirm)',
   'Not printed for afternoon slots. Follow the time written on your form, or ask your care team.',
   true, 80, '3', 150, 1000, 'picoprep'),
  ('p4-pm', 'dose', 'pm', 'report_relative', NULL, NULL, 5.0,
   'Picoprep packet 4 (about 5h before reporting)',
   'Guide only — last dose often 2–5 hours before the procedure. Prefer the time written on your form.',
   true, 90, '4', 150, 1000, 'picoprep'),

  -- shared close
  ('stool-check', 'stool', 'any', 'report_relative', NULL, NULL, 3.0,
   'Check your stool against the colour scale',
   'The SGH/NCCS form has no stool chart. This guide adapts TTSH''s 6-point scale. If stool still looks like stages 1–4, call the number below or report 2 hours early.',
   false, 100, NULL, NULL, NULL, NULL),
  ('fast', 'fast', 'any', 'report_relative', NULL, NULL, 2.0,
   'Stop all fluids',
   'Clear fluids only until this time, then nothing by mouth.',
   false, 110, NULL, NULL, NULL, NULL),
  ('arrive', 'arrive', 'any', 'report_relative', NULL, NULL, 0.0,
   'Report to endoscopy',
   'Arrive at your reporting time.',
   false, 120, NULL, NULL, NULL, NULL)
) AS s(
  step_key, kind, slot, timing_mode, day_offset, clock_time, hours_before_report,
  title, detail, tentative, sort_order,
  dose_label, mix_volume_ml, follow_fluid_ml, agent
)
WHERE p.name = 'sgh-nccs-picoprep'
  AND v.version_id = 1;

-- ---------------------------------------------------------------------------
-- TTSH Picoprep-only · 8am–2pm (brochure page 4 · both sachets the day before)
-- ---------------------------------------------------------------------------
UPDATE protocol_versions v
SET notes = 'TTSH Picoprep-only · 8am–2pm sheet. Both sachets the day before (2–3pm and 8–9pm).'
FROM protocols p
WHERE p.id = v.protocol_id AND p.name = 'ttsh-picoprep (8am-2pm)' AND v.version_id = 1;

DELETE FROM protocol_steps
WHERE protocol_version_id IN (
  SELECT v.id FROM protocol_versions v
  JOIN protocols p ON p.id = v.protocol_id
  WHERE p.name = 'ttsh-picoprep (8am-2pm)' AND v.version_id = 1
);

INSERT INTO protocol_steps (
  protocol_version_id, step_key, kind, slot, timing_mode,
  day_offset, clock_time, hours_before_report,
  title, detail, tentative, sort_order,
  dose_label, mix_volume_ml, follow_fluid_ml, agent
)
SELECT
  v.id,
  s.step_key, s.kind::event_kind, s.slot::step_slot, s.timing_mode::timing_mode,
  s.day_offset, s.clock_time::time, s.hours_before_report,
  s.title, s.detail, s.tentative, s.sort_order,
  s.dose_label, s.mix_volume_ml, s.follow_fluid_ml, s.agent
FROM protocol_versions v
JOIN protocols p ON p.id = v.protocol_id
CROSS JOIN (
  VALUES
  -- Page 4 does not reprint the 3-day diet list; keep the protocol diet_days lead-in.
  ('diet-start', 'diet', 'any', 'day_clock', -3, '00:00', NULL,
   'Start low-residue diet (3 days)',
   'A low-residue diet is a temporary eating plan that limits high-fiber foods and other hard-to-digest items to reduce the amount of undigested material passing through your large intestine.',
   false, 30, NULL, NULL, NULL, NULL),

  -- 1 DAY BEFORE
  ('breakfast-eve', 'meal', 'any', 'day_clock', -1, '07:00', NULL,
   'Light low-fibre breakfast',
   'As on brochure page 4. Follow the TTSH low-fibre diet list.',
   false, 35, NULL, NULL, NULL, NULL),
  ('lunch-eve', 'meal', 'any', 'day_clock', -1, '12:00', NULL,
   'Light low-fibre lunch',
   'As on brochure page 4. Follow the TTSH low-fibre diet list.',
   false, 40, NULL, NULL, NULL, NULL),
  ('ttsh-p1', 'dose', 'any', 'day_clock', -1, '14:00', NULL,
   'Picoprep packet 1 (2–3pm)',
   'Mix 1 packet of powder with 150 ml of warm water and stir for 2 to 3 minutes. Then drink at least 1 litre or 2 cups of plain water (1 cup = 500 ml), using the PICOPREP cup given.',
   false, 50, '1', 150, 1000, 'picoprep'),
  ('last-meal-eve', 'meal', 'any', 'day_clock', -1, '18:00', NULL,
   'Light low-fibre dinner',
   'Eat between 6pm and 6:30pm. No more food allowed after 6:30pm.',
   false, 60, NULL, NULL, NULL, NULL),
  ('ttsh-p2', 'dose', 'any', 'day_clock', -1, '20:00', NULL,
   'Picoprep packet 2 (8–9pm)',
   'Mix 1 packet of powder with 150 ml of warm water and stir for 2 to 3 minutes. Then drink at least 1 litre or 2 cups of plain water (1 cup = 500 ml), using the PICOPREP cup given.',
   false, 70, '2', 150, 1000, 'picoprep'),

  -- ON THE DAY
  ('no-food-midnight', 'meal', 'any', 'day_clock', 0, '00:00', NULL,
   'No food from midnight',
   'No food allowed from 12 midnight onwards.',
   false, 80, NULL, NULL, NULL, NULL),
  ('stool-check', 'stool', 'any', 'report_relative', NULL, NULL, 3.0,
   'Check your stool against the colour scale',
   'If stool still looks like stages 1–4, report 2 hours early and call Endo PACE / the endoscopy centre.',
   false, 100, NULL, NULL, NULL, NULL),
  ('fast', 'fast', 'any', 'report_relative', NULL, NULL, 2.0,
   'Stop all fluids',
   'Stop drinking fluids including plain water. This is 2 hours before the procedure on brochure page 4.',
   false, 110, NULL, NULL, NULL, NULL),
  ('arrive', 'arrive', 'any', 'report_relative', NULL, NULL, 0.0,
   'Report to Endoscopy Centre',
   'Arrive at the reporting time written on your form.',
   false, 120, NULL, NULL, NULL, NULL)
) AS s(
  step_key, kind, slot, timing_mode, day_offset, clock_time, hours_before_report,
  title, detail, tentative, sort_order,
  dose_label, mix_volume_ml, follow_fluid_ml, agent
)
WHERE p.name = 'ttsh-picoprep (8am-2pm)'
  AND v.version_id = 1;

-- ---------------------------------------------------------------------------
-- TTSH Picoprep-only · 2pm–5pm (brochure page 4 · split dose)
-- ---------------------------------------------------------------------------
INSERT INTO protocol_steps (
  protocol_version_id, step_key, kind, slot, timing_mode,
  day_offset, clock_time, hours_before_report,
  title, detail, tentative, sort_order,
  dose_label, mix_volume_ml, follow_fluid_ml, agent
)
SELECT
  v.id,
  s.step_key, s.kind::event_kind, s.slot::step_slot, s.timing_mode::timing_mode,
  s.day_offset, s.clock_time::time, s.hours_before_report,
  s.title, s.detail, s.tentative, s.sort_order,
  s.dose_label, s.mix_volume_ml, s.follow_fluid_ml, s.agent
FROM protocol_versions v
JOIN protocols p ON p.id = v.protocol_id
CROSS JOIN (
  VALUES
  ('diet-start', 'diet', 'any', 'day_clock', -3, '00:00', NULL,
   'Start low-residue diet (3 days)',
   'A low-residue diet is a temporary eating plan that limits high-fiber foods and other hard-to-digest items to reduce the amount of undigested material passing through your large intestine.',
   false, 30, NULL, NULL, NULL, NULL),

  -- 1 DAY BEFORE
  ('breakfast-eve', 'meal', 'any', 'day_clock', -1, '07:00', NULL,
   'Light low-fibre breakfast',
   'Follow the TTSH low-residue diet list.',
   false, 35, NULL, NULL, NULL, NULL),
  ('lunch-eve', 'meal', 'any', 'day_clock', -1, '12:00', NULL,
   'Light low-fibre lunch',
   'Follow the TTSH low-residue diet list.',
   false, 40, NULL, NULL, NULL, NULL),
  ('last-meal-eve', 'meal', 'any', 'day_clock', -1, '18:00', NULL,
   'Light low-fibre dinner',
   'Eat between 6pm and 6:30pm.',
   false, 50, NULL, NULL, NULL, NULL),
  ('ttsh-p1', 'dose', 'any', 'day_clock', -1, '20:00', NULL,
   'Picoprep packet 1 (8–9pm)',
   'Mix 1 packet of powder with 150 ml of warm water and stir for 2 to 3 minutes. Then drink at least 1 litre or 2 cups of plain water (1 cup = 500 ml), using the PICOPREP cup given.',
   false, 60, '1', 150, 1000, 'picoprep'),

  -- ON THE DAY
  ('breakfast-am', 'meal', 'any', 'day_clock', 0, '06:00', NULL,
   'Light low-fibre breakfast',
   'Eat between 6am and 6:30am. No more food allowed after 6:30am.',
   false, 80, NULL, NULL, NULL, NULL),
  ('ttsh-p2', 'dose', 'any', 'day_clock', 0, '07:00', NULL,
   'Picoprep packet 2 (7–8am)',
   'Mix 1 packet of powder with 150 ml of warm water and stir for 2 to 3 minutes. Then drink at least 1 litre or 2 cups of plain water (1 cup = 500 ml), using the PICOPREP cup given.',
   false, 90, '2', 150, 1000, 'picoprep'),
  ('stool-check', 'stool', 'any', 'report_relative', NULL, NULL, 3.0,
   'Check your stool against the colour scale',
   'If stool still looks like stages 1–4, report 2 hours early and call Endo PACE / the endoscopy centre.',
   false, 100, NULL, NULL, NULL, NULL),
  ('fast', 'fast', 'any', 'report_relative', NULL, NULL, 2.0,
   'Stop all fluids',
   'Stop drinking fluids including plain water. Continue other usual medications at least 2 hours before your colonoscopy, with small amounts of water.',
   false, 110, NULL, NULL, NULL, NULL),
  ('arrive', 'arrive', 'any', 'report_relative', NULL, NULL, 0.0,
   'Report to Endoscopy Centre',
   'Arrive at the reporting time written on your form.',
   false, 120, NULL, NULL, NULL, NULL)
) AS s(
  step_key, kind, slot, timing_mode, day_offset, clock_time, hours_before_report,
  title, detail, tentative, sort_order,
  dose_label, mix_volume_ml, follow_fluid_ml, agent
)
WHERE p.name = 'ttsh-picoprep (2pm-5pm)'
  AND v.version_id = 1;

-- ---------------------------------------------------------------------------
-- TTSH Picoprep + PEG (pages 5–6)
-- ---------------------------------------------------------------------------
INSERT INTO protocol_steps (
  protocol_version_id, step_key, kind, slot, timing_mode,
  day_offset, clock_time, hours_before_report,
  title, detail, tentative, sort_order,
  dose_label, mix_volume_ml, follow_fluid_ml, agent
)
SELECT
  v.id,
  s.step_key, s.kind::event_kind, s.slot::step_slot, s.timing_mode::timing_mode,
  s.day_offset, s.clock_time::time, s.hours_before_report,
  s.title, s.detail, s.tentative, s.sort_order,
  s.dose_label, s.mix_volume_ml, s.follow_fluid_ml, s.agent
FROM protocol_versions v
JOIN protocols p ON p.id = v.protocol_id
CROSS JOIN (
  VALUES
  ('diet-start', 'diet', 'any', 'day_clock', -3, '00:00', NULL,
   'Start low-residue diet (3 days)',
   'Follow the TTSH diet list until your last meal.',
   false, 30, NULL, NULL, NULL, NULL),
  ('ttsh-p1', 'dose', 'any', 'day_clock', -1, '14:30', NULL,
   'Picoprep sachet 1 (eve)',
   'Take around 2–3pm on the eve of scope (confirm on pages 5–6).',
   false, 40, '1', 150, 1000, 'picoprep'),
  ('ttsh-p2', 'dose', 'any', 'day_clock', -1, '20:30', NULL,
   'Picoprep sachet 2 (eve)',
   'Take around 8–9pm on the eve of scope (confirm on pages 5–6).',
   false, 50, '2', 150, 1000, 'picoprep'),
  ('last-meal-eve', 'meal', 'any', 'day_clock', -1, '19:00', NULL,
   'Last meal',
   'Light dinner until 7pm on the eve of scope.',
   false, 55, NULL, NULL, NULL, NULL),
  ('peg-am', 'dose', 'any', 'day_clock', 0, '05:30', NULL,
   'PEG morning dose',
   'Mix 1 packet PEG with 1L water; drink between 5–6am.',
   false, 70, 'PEG', NULL, 1000, 'peg'),
  ('stool-check', 'stool', 'any', 'report_relative', NULL, NULL, 3.0,
   'Check your stool against the colour scale',
   'If stool still looks like stages 1–4, report 2 hours early and call Endo PACE / the endoscopy centre.',
   false, 100, NULL, NULL, NULL, NULL),
  ('fast', 'fast', 'any', 'report_relative', NULL, NULL, 2.0,
   'Stop all fluids',
   'Clear fluids only until this time, then nothing by mouth.',
   false, 110, NULL, NULL, NULL, NULL),
  ('arrive', 'arrive', 'any', 'report_relative', NULL, NULL, 0.0,
   'Report to endoscopy',
   'Arrive at your reporting time.',
   false, 120, NULL, NULL, NULL, NULL)
) AS s(
  step_key, kind, slot, timing_mode, day_offset, clock_time, hours_before_report,
  title, detail, tentative, sort_order,
  dose_label, mix_volume_ml, follow_fluid_ml, agent
)
WHERE p.name = 'ttsh-picoprep-peg (8am-2pm)'
  AND v.version_id = 1;
