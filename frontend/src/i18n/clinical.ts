/** Stool/contact, food-system, and rule-title copy. Hospital source lines stay in English. */

export const CLINICAL_EN = {
  'hosp.sgh.stoolAction':
    'SGH form has no stool chart. This guide uses the Bristol stool scale so you can compare appearance.',
  'hosp.sgh.formGap': 'Times for Picoprep are handwritten blanks. Afternoon slots are not printed.',
  'hosp.sgh.c0.label': 'Ambulatory Endoscopy Centre',
  'hosp.sgh.c0.hours': 'Confirm hours with your care team',
  'hosp.sgh.c0.note':
    'The yellow form prints no telephone number (F9). This is the publicly listed AEC line — confirm it at counselling.',
  'hosp.sgh.c1.label': 'SGH general enquiries',
  'hosp.sgh.c1.hours': '24-hour switchboard',
  'hosp.sgh.c1.note': 'Ask to be put through to endoscopy if the AEC line is closed.',
  'hosp.nccs.stoolAction':
    'The SGH/NCCS form has no stool chart. This guide uses the Bristol stool scale so you can compare appearance.',
  'hosp.nccs.formGap': 'Medication stop dates live on a separate handwritten annex, not the yellow form.',
  'hosp.nccs.c0.label': 'NCCS main line',
  'hosp.nccs.c0.hours': 'Confirm hours with your care team',
  'hosp.nccs.c0.note': 'The yellow form prints no number. Confirm the endoscopy contact given at counselling.',
  'hosp.nccs.c1.label': 'SGH Ambulatory Endoscopy Centre',
  'hosp.nccs.c1.hours': 'Confirm hours with your care team',
  'hosp.nccs.c1.note':
    'NCCS procedures often run through the SGH endoscopy pathway. Confirm which number applies to you.',
  'hosp.ttsh.formGap': 'TTSH issues separate PDFs per appointment slot.',
  'hosp.ttsh.c0.label': 'Endo PACE',
  'hosp.ttsh.c0.hours': 'Mon–Fri 8:00am–5:00pm',
  'hosp.ttsh.c0.note':
    'Publicly listed on the TTSH Endoscopy Centre page. TTSH is the only sheet with a reachable after-hours pathway via central hotline.',
  'hosp.ttsh.c1.label': 'Endoscopy Centre',
  'hosp.ttsh.c1.hours': 'Mon–Fri 8:00am–5:00pm; closed weekends & PH',
  'hosp.ttsh.c1.note': 'Level 2, TTSH Atrium Block.',
  'hosp.ttsh.c2.label': 'Central hotline',
  'hosp.ttsh.c2.hours': 'Mon–Fri 8:00am–5:00pm; Sat 8:00am–12:00pm',
  'hosp.ttsh.c2.note': 'Use this if clinic lines are closed. Confirm after-hours coverage with your care team.',
  'hosp.skh.stoolAction':
    'SKH’s form has a 5-point cup chart. This guide uses the Bristol stool scale so you can compare appearance.',
  'hosp.skh.formGap':
    'SKH already generates a personalised timeline on its website — this microsite mirrors that pattern for demo.',
  'hosp.skh.c0.label': 'Sengkang General Hospital',
  'hosp.skh.c0.hours': 'Confirm hours with your care team',
  'hosp.skh.c0.note':
    'SKH website does not print an after-hours prep hotline. Confirm the number given at counselling.',
  'hosp.cgh.stoolAction':
    'CGH brochure has no stool chart. This guide uses the Bristol stool scale so you can compare appearance.',
  'hosp.cgh.formGap': 'Prep agent is PEG, not Picoprep. Day-of meds: BP at 6am; no diabetic medication.',
  'hosp.cgh.c0.label': 'CGH main line',
  'hosp.cgh.c0.hours': 'Office hours only on the CGH sheet',
  'hosp.cgh.c0.note':
    'CGH lists clinic numbers for office hours only — there is no printed after-hours prep hotline.',
  'hosp.cgh.c1.label': 'Appointment centre',
  'hosp.cgh.c1.hours': 'Office hours — confirm with your care team',
  'hosp.cgh.c1.note': 'Publicly listed appointment line, not a night-before clinical hotline.',

  'food.empty': 'Type a food or drink — for example, “can I have prata?”',
  'food.deflectTitle': 'Ask your care team',
  'food.deflectBody':
    'That sits outside the signed food ruleset. This assistant only classifies foods and a few named medication flags against your hospital’s sheet. It will not invent an answer.',
  'food.gapTitle': 'Not in the ruleset',
  'food.gapBody':
    '“{q}” is not a named line on your hospital sheet, and no approved rule classifies it. Ask your care team — this is recorded as a gap, not a guess.',
  'food.symptomTitle': 'This is not an emergency line',
  'food.symptomBody':
    'If you feel unwell, call your hospital’s number from the Stool + contact tab, or 995. This site cannot triage symptoms.',
  'food.forHospital': 'Answering for {hospital} only.',
  'food.chickenTitle': 'Chicken rice — split, not a single yes/no',
  'food.chickenBody':
    'The white rice can be allowed. The cucumber garnish is not. Chilli and oily rice are not named. Ask for plain white rice and steamed chicken, no cucumber.',
  'food.splitRice': 'The rice',
  'food.splitRiceBody': 'White rice is a refined starch (R1).',
  'food.splitCucumber': 'Cucumber garnish',
  'food.splitCucumberBody': 'Vegetables are excluded (R3).',
  'food.splitChilli': 'Chilli / oily rice',
  'food.splitChilliBody': 'Not named on the sheet.',
  'rule.R1': 'Refined starches allowed',
  'rule.R2': 'Lean protein allowed',
  'rule.R3': 'No plant fibre',
  'rule.R4': 'No dairy, no plant milks',
  'rule.R5': 'Nothing fried',
  'rule.R6': 'No skins',
  'rule.Q1': 'Open: light fruit juice',
  'rule.Q2': 'Open: rice cereal',
  'rule.Q3': 'Open: plain prata',
  'rule.Q4': 'Open: cheese',
  'rule.Q5': 'Open: vegetarian protein',
  'rule.Q6': 'Open: strained clear soup',
  'rule.Q7': 'Open: white sweets',
  'rule.F1': 'Conflict: Plavix / clopidogrel timing',
  'rule.F2': 'Gap: SGLT2 inhibitors',
  'rule.F5': 'Conflict: milk in coffee/tea',
  'rule.F6': 'Conflict: fruit juice',
  'rule.F7': 'Gap: prata vs fried food',
  'rule.HOSP': 'Follow this hospital only',
  'rule.SCOPE': 'Outside the ruleset',
} as const

