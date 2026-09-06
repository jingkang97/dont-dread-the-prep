-- Timeline step seeds for SGH/NCCS Picoprep and TTSH Picoprep (± PEG).
-- Depends on: mvp.sql, mvp.seed.sql, protocol_steps.sql.
--
-- Resolver: load steps where slot IN ('any', session.slot), then:
--   day_clock       → procedure_date + day_offset @ clock_time
--   report_relative → reporting_time − hours_before_report

-- Safe if event_kind was created before 'check' existed; no-op on a fresh install.
ALTER TYPE event_kind ADD VALUE IF NOT EXISTS 'check';

-- ---------------------------------------------------------------------------
-- Protocol metadata extras
-- ---------------------------------------------------------------------------
UPDATE protocols SET source_label = 'SGH/NCCS yellow form'
WHERE name = 'sgh-nccs-picoprep';

UPDATE protocols SET source_label = 'TTSH brochure March 2026 · Picoprep-only (page 4)'
WHERE name = 'ttsh-picoprep';

UPDATE protocols SET source_label = 'TTSH brochure March 2026 · Picoprep+PEG (pages 5–6)'
WHERE name = 'ttsh-picoprep-peg';

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
  (SELECT id FROM protocols WHERE name = 'ttsh-picoprep'),
  1,
  '2026-03',
  DATE '2026-03-01',
  'TTSH Picoprep-only path · 8am–2pm / 2pm–5pm slot PDFs.'
),
(
  (SELECT id FROM protocols WHERE name = 'ttsh-picoprep-peg'),
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
  ('p3-pm', 'gap', 'pm', 'day_clock', 0, '08:00', NULL,
   'Picoprep packet 3 (handwritten / confirm)',
   'Not printed for afternoon slots. Follow the time written on your form, or ask your care team.',
   true, 80, '3', 150, 1000, 'picoprep'),
  ('p4-pm', 'gap', 'pm', 'report_relative', NULL, NULL, 5.0,
   'Picoprep packet 4 (about 5h before reporting)',
   'Guide only — last dose often 2–5 hours before the procedure. Prefer the time written on your form.',
   true, 90, '4', 150, 1000, 'picoprep'),

  -- shared close
  ('stool-check', 'check', 'any', 'report_relative', NULL, NULL, 3.0,
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
-- TTSH Picoprep-only (2 sachets, slot-specific PDFs)
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
  ('last-meal-eve', 'meal', 'any', 'day_clock', -1, '18:30', NULL,
   'Last meal',
   'Light dinner until 6:30pm on the eve of scope.',
   false, 40, NULL, NULL, NULL, NULL),

  -- AM (8am–2pm PDF)
  ('ttsh-p1', 'dose', 'am', 'day_clock', -1, '18:00', NULL,
   'Picoprep (eve)',
   'Take the evening Picoprep dose as on the 8am–2pm PDF.',
   false, 50, '1', 150, 1000, 'picoprep'),
  ('ttsh-p2', 'dose', 'am', 'day_clock', 0, '05:00', NULL,
   'Picoprep (morning)',
   'Take the morning Picoprep dose as on the 8am–2pm PDF.',
   false, 60, '2', 150, 1000, 'picoprep'),

  -- PM (2pm–5pm PDF)
  ('ttsh-p1-pm', 'dose', 'pm', 'day_clock', 0, '06:00', NULL,
   'Picoprep (first dose · afternoon slot)',
   'Follow the 2pm–5pm PDF timing for the first sachet.',
   false, 50, '1', 150, 1000, 'picoprep'),
  ('ttsh-p2-pm', 'dose', 'pm', 'report_relative', NULL, NULL, 5.0,
   'Picoprep (second dose · ~5h before reporting)',
   'Confirm exact time on your slot PDF; this is a guide when the PDF ties the last dose to arrival.',
   true, 60, '2', 150, 1000, 'picoprep'),

  ('stool-check', 'check', 'any', 'report_relative', NULL, NULL, 3.0,
   'Check your stool against the colour scale',
   'If stool still looks like stages 1–4, report 2 hours early and call Endo PACE / the endoscopy centre.',
   false, 100, NULL, NULL, NULL, NULL),
  ('fast', 'fast', 'any', 'report_relative', NULL, NULL, 2.0,
   'Stop all fluids',
   'Clear fluids only until this time, then nothing by mouth.',
   false, 110, NULL, NULL, NULL, NULL),
  ('arrive', 'arrive', 'any', 'report_relative', NULL, NULL, 0.0,
   'Report to endoscopy',
   'Arrive at your reporting time (TTSH: typically 2h before procedure on the AM path).',
   false, 120, NULL, NULL, NULL, NULL)
) AS s(
  step_key, kind, slot, timing_mode, day_offset, clock_time, hours_before_report,
  title, detail, tentative, sort_order,
  dose_label, mix_volume_ml, follow_fluid_ml, agent
)
WHERE p.name = 'ttsh-picoprep'
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
  ('stool-check', 'check', 'any', 'report_relative', NULL, NULL, 3.0,
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
WHERE p.name = 'ttsh-picoprep-peg'
  AND v.version_id = 1;
