INSERT INTO protocols (
  name, prep_agent, prep_agent_label, diet_days,
  milk_in_coffee, fruit_juice, rice_cereal, coffee_tea,
  listed, reporting_from, reporting_until
) VALUES
(
  'sgh-nccs-picoprep',
  'picoprep',
  'Picoprep · 4 sachets',
  3,
  'no', 'no', 'no', 'yes',
  true, NULL, NULL
),
(
  'ttsh-picoprep (8am-2pm)',
  'picoprep',
  'Picoprep',
  3,
  'yes', 'ask', 'no', 'yes',
  true, NULL, TIME '14:00'
),
(
  'ttsh-picoprep (2pm-5pm)',
  'picoprep',
  'Picoprep',
  3,
  'yes', 'ask', 'no', 'yes',
  false, TIME '14:00', NULL
),
(
  'ttsh-picoprep-peg (8am-2pm)',
  'picoprep-peg',
  'Picoprep + PEG',
  3,
  'yes', 'ask', 'no', 'yes',
  true, NULL, TIME '14:00'
),
(
  'ttsh-picoprep-peg (2pm-5pm)',
  'picoprep-peg',
  'Picoprep + PEG',
  3,
  'yes', 'ask', 'no', 'yes',
  false, TIME '14:00', NULL
),
(
  'ttsh-peg-2l (8am-2pm)',
  'peg',
  'PEG 2L',
  3,
  'yes', 'ask', 'no', 'yes',
  true, NULL, TIME '14:00'
),
(
  'ttsh-peg-3l (8am-2pm)',
  'peg-3l',
  'PEG 3L',
  3,
  'yes', 'ask', 'no', 'yes',
  true, NULL, TIME '14:00'
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
  (SELECT id FROM protocols WHERE name = 'ttsh-picoprep (8am-2pm)')
),
(
  (SELECT id FROM hospitals WHERE code = 'ttsh'),
  (SELECT id FROM protocols WHERE name = 'ttsh-picoprep (2pm-5pm)')
),
(
  (SELECT id FROM hospitals WHERE code = 'ttsh'),
  (SELECT id FROM protocols WHERE name = 'ttsh-picoprep-peg (8am-2pm)')
),
(
  (SELECT id FROM hospitals WHERE code = 'ttsh'),
  (SELECT id FROM protocols WHERE name = 'ttsh-picoprep-peg (2pm-5pm)')
),
(
  (SELECT id FROM hospitals WHERE code = 'ttsh'),
  (SELECT id FROM protocols WHERE name = 'ttsh-peg-2l (8am-2pm)')
),
(
  (SELECT id FROM hospitals WHERE code = 'ttsh'),
  (SELECT id FROM protocols WHERE name = 'ttsh-peg-3l (8am-2pm)')
);
