INSERT INTO protocols (
  name, prep_agent, prep_agent_label, diet_days,
  last_meal, last_meal_note, fluid_stop_hours,
  milk_in_coffee, fruit_juice, rice_cereal, coffee_tea, form_gap
) VALUES
(
  'sgh-nccs-picoprep',
  'picoprep',
  'Picoprep · 4 sachets',
  3,
  'No food after dinner on the eve of scope',
  'SGH/NCCS yellow form. Same prep agent as TTSH Picoprep-only; different dosing (4 sachets, handwritten times). Day-of: 2 plain white bread or 2 plain biscuits, then no food after breakfast. Clear fluids (max 200ml) up to 2h before procedure.',
  2,
  'no', 'no', 'no', 'yes',
  'Times for Picoprep are handwritten blanks. Afternoon slots are not printed.'
),
(
  'ttsh-picoprep',
  'picoprep',
  'Picoprep · 2 sachets (8am–2pm PDF)',
  3,
  'Light dinner until 6:30pm on the eve of scope',
  'TTSH Picoprep-only path (brochure page 4, 8am–2pm). Same prep agent as SGH/NCCS; different dosing (2 sachets ~2–3pm and 8–9pm). No food after 6:30pm. Report 2h before procedure.',
  2,
  'yes', 'ask', 'no', 'yes',
  'TTSH issues separate PDFs per appointment slot. This protocol is Picoprep-only (page 4), not Picoprep+PEG.'
),
(
  'ttsh-picoprep-peg',
  'picoprep-peg',
  'Picoprep · 2 sachets + PEG (8am–2pm PDF)',
  3,
  'Light dinner until 7pm on the eve of scope',
  'TTSH Picoprep+PEG path (brochure pages 5–6, 8am–2pm). Eve Picoprep ~2–3pm and 8–9pm; no food after 7pm. Day-of: mix 1 packet PEG with 1L water, drink 5–6am.',
  2,
  'yes', 'ask', 'no', 'yes',
  'Same TTSH brochure as Picoprep-only; follow pages 5–6. Slot-specific PDF still applies.'
);

INSERT INTO hospitals (code, short_name, name, cluster, contacts)
VALUES
(
  'sgh',
  'SGH',
  'Singapore General Hospital',
  'SingHealth',
  '[
    {"label":"Ambulatory Endoscopy Centre","phone":"63266131","hours":"Confirm hours with your care team","note":"Yellow form prints no telephone number. Confirm at counselling."},
    {"label":"SGH general enquiries","phone":"62223322","hours":"24-hour switchboard","note":"Ask for endoscopy if the AEC line is closed."}
  ]'::jsonb
),
(
  'nccs',
  'NCCS',
  'National Cancer Centre Singapore',
  'SingHealth',
  '[
    {"label":"NCCS main line","phone":"64368088","hours":"Confirm hours with your care team","note":"Yellow form prints no number. Confirm endoscopy contact at counselling."},
    {"label":"SGH Ambulatory Endoscopy Centre","phone":"63266131","hours":"Confirm hours with your care team","note":"NCCS procedures often run through the SGH endoscopy pathway."}
  ]'::jsonb
),
(
  'ttsh',
  'TTSH',
  'Tan Tock Seng Hospital',
  'NHG',
  '[
    {"label":"Endo PACE","phone":"63573766","hours":"Mon–Fri 8:00am–5:00pm","note":"TTSH Medical Centre, Level 2."},
    {"label":"Endoscopy Centre","phone":"63578485","hours":"Mon–Fri 8:00am–5:00pm; closed weekends & PH","note":"Level 2, TTSH Atrium Block."},
    {"label":"Central hotline","phone":"63577000","hours":"Mon–Fri 8:00am–5:00pm; Sat 8:00am–12:00pm","note":"Printed on the TTSH brochure footer."}
  ]'::jsonb
);

INSERT INTO hospital_protocols (hospital_id, protocol_id)
VALUES
(
  (SELECT id FROM hospitals WHERE code = 'sgh'),
  (SELECT id FROM protocols WHERE name = 'sgh-nccs-picoprep')
),
(
  (SELECT id FROM hospitals WHERE code = 'nccs'),
  (SELECT id FROM protocols WHERE name = 'sgh-nccs-picoprep')
),
(
  (SELECT id FROM hospitals WHERE code = 'ttsh'),
  (SELECT id FROM protocols WHERE name = 'ttsh-picoprep')
),
(
  (SELECT id FROM hospitals WHERE code = 'ttsh'),
  (SELECT id FROM protocols WHERE name = 'ttsh-picoprep-peg')
);
