-- Diet fields the Protocol ORM already maps. Older DBs created protocols
-- without these columns (see mvp.sql). Safe to re-run.
-- Depends on: mvp.sql (protocols + three_way)

ALTER TABLE protocols ADD COLUMN IF NOT EXISTS last_meal TEXT;
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS last_meal_note TEXT NOT NULL DEFAULT '';
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS fluid_stop_hours INT;
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS form_gap TEXT NOT NULL DEFAULT '';

UPDATE protocols
SET
  last_meal = 'No food after dinner on the eve of scope',
  last_meal_note = 'SGH/NCCS yellow form. Same prep agent as TTSH Picoprep-only; different dosing (4 sachets, handwritten times). Day-of: 2 plain white bread or 2 plain biscuits, then no food after breakfast. Clear fluids (max 200ml) up to 2h before procedure.',
  fluid_stop_hours = 2,
  form_gap = 'Times for Picoprep are handwritten blanks. Afternoon slots are not printed.'
WHERE name = 'sgh-nccs-picoprep';

UPDATE protocols
SET
  last_meal = 'Light dinner until 6:30pm on the eve of scope',
  last_meal_note = 'TTSH Picoprep-only path (brochure page 4). Same prep agent as SGH/NCCS; different dosing (2 sachets). No food after 6:30pm. Report 2h before procedure.',
  fluid_stop_hours = 2,
  form_gap = 'TTSH issues separate PDFs per appointment slot. This protocol is Picoprep-only, not Picoprep+PEG.'
WHERE name LIKE 'ttsh-picoprep (%'
  AND name NOT LIKE '%peg%';

UPDATE protocols
SET
  last_meal = 'Light dinner until 7pm on the eve of scope',
  last_meal_note = 'TTSH Picoprep+PEG path (brochure pages 5–6). Eve Picoprep; no food after 7pm. Day-of: mix 1 packet PEG with 1L water.',
  fluid_stop_hours = 2,
  form_gap = 'Same TTSH brochure as Picoprep-only; follow the Picoprep+PEG pages. Slot-specific PDF still applies.'
WHERE name LIKE 'ttsh-picoprep-peg%';

UPDATE protocols
SET
  last_meal = 'Light dinner until 6:30pm on the eve of scope',
  last_meal_note = 'TTSH PEG 2L path (2L PEG Solution sheet, 8am–2pm). Mix 2 packets with 2L; drink 7–9pm the day before. No food after 6:30pm. Report 2h before procedure.',
  fluid_stop_hours = 2,
  form_gap = 'TTSH issues separate PDFs per appointment slot. This protocol is PEG 2L only, not Picoprep.'
WHERE name = 'ttsh-peg-2l (8am-2pm)';

UPDATE protocols
SET
  last_meal = 'Light breakfast until 6:30am on the day of scope',
  last_meal_note = 'TTSH PEG 2L path (2L PEG Solution sheet, 2pm–5pm). Eve: light meals only. Day-of: light breakfast 6–6:30am, then no food. Mix 2 packets with 2L; drink 7–9am. Stop fluids 2h before procedure.',
  fluid_stop_hours = 2,
  form_gap = 'TTSH issues separate PDFs per appointment slot. This protocol is PEG 2L only, not Picoprep. Morning PEG sheet for afternoon appointments.'
WHERE name = 'ttsh-peg-2l (2pm-5pm)';

UPDATE protocols
SET
  last_meal = 'Light dinner until 6:30pm on the eve of scope',
  last_meal_note = 'TTSH PEG 3L path (3L PEG Solution sheet, 8am–2pm). Mix 2 packets with 2L at 7–9pm the day before; mix 1 packet with 1L at 5–6am on the day. No food after 6:30pm. Stop all fluids from 6am.',
  fluid_stop_hours = 2,
  form_gap = 'TTSH issues separate PDFs per appointment slot. This protocol is PEG 3L only, not Picoprep or PEG 2L. Fluid stop is 6am on the sheet, not 2h before reporting.'
WHERE name = 'ttsh-peg-3l (8am-2pm)';

UPDATE protocols
SET
  last_meal = 'Light breakfast until 5:30am on the day of scope',
  last_meal_note = 'TTSH PEG 3L path (3L PEG Solution sheet, 2pm–5pm). Eve: light meals only. Day-of: light breakfast 5–5:30am, then no food. Mix 3 packets with 3L; drink 6–9am. Stop fluids 2h before procedure.',
  fluid_stop_hours = 2,
  form_gap = 'TTSH issues separate PDFs per appointment slot. This protocol is PEG 3L only. Morning 3L sheet for afternoon appointments.'
WHERE name = 'ttsh-peg-3l (2pm-5pm)';

UPDATE protocols
SET
  last_meal = COALESCE(last_meal, 'Follow the last-meal line on your hospital form.'),
  last_meal_note = COALESCE(last_meal_note, ''),
  fluid_stop_hours = COALESCE(fluid_stop_hours, 2),
  form_gap = COALESCE(form_gap, '')
WHERE last_meal IS NULL OR fluid_stop_hours IS NULL;

ALTER TABLE protocols ALTER COLUMN last_meal SET NOT NULL;
ALTER TABLE protocols ALTER COLUMN fluid_stop_hours SET NOT NULL;
