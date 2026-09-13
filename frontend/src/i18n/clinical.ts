/** Timeline, stool/contact, food-system, and rule-title copy. Hospital source lines stay in English. */

export const CLINICAL_EN = {
  'ev.dietStart': 'Low-residue diet starts ({days} days before)',
  'ev.dietStartBody':
    '{hospital} prescribes a {days}-day low-residue diet. This tool follows your hospital, not the 1-day guideline for low-risk patients. Allowed examples: white rice, white bread, plain noodles, lean protein, tofu, eggs. Not: fruit, vegetables, dairy, wholegrains, fried food, red meat.',
  'ev.lastMeal': 'Last meal on the eve of scope',
  'ev.packet': 'Picoprep packet {n}',
  'ev.packetBefore6': 'Picoprep packet {n} (before 6am)',
  'ev.packetPm': 'Picoprep packet {n} (afternoon session)',
  'ev.packetHand': 'Picoprep packet {n} — confirm handwritten time',
  'ev.mix':
    'Mix packet {n} with 150ml warm water until dissolved, then {fluid}. Stay near a toilet — bowel motions usually start within a few hours.',
  'ev.fluid1L': '1 litre of clear fluid',
  'ev.stopFluids': 'Stop all fluids ({hours}h before reporting)',
  'ev.stopFluidsSkh': 'SKH: no more water/fluids 4 hours before your reporting time.',
  'ev.stopFluidsSgh': 'SGH/NCCS: clear fluids (max 200ml) up to 2 hours before the procedure. Then stop.',
  'ev.report': 'Report to {hospital} endoscopy',
  'ev.reportBody':
    'Reporting time {time}. Bring your prep form. If stool is still stages 1–4 on the guide, report 2 hours early and call first.',
  'ev.stoolCheck': 'Check your stool against the colour scale',
  'ev.med7': 'If prescribed — iron, Plavix, anti-diarrhoeals',
  'ev.med7Body':
    'TTSH brochure: stop these 7 days before. This is TTSH’s sheet, not SGH’s 5-day annex. Follow the list your counsellor wrote. If you are on these drugs and unsure, ask your care team.',
  'ev.sglt2': 'If prescribed — SGLT2 inhibitors',
  'ev.sglt2Body': 'TTSH: stop empagliflozin / dapagliflozin 2 days before. Still confirm against your own list.',
  'ev.med5': 'If your annex says so — blood thinners',
  'ev.med5Body':
    'The SGH/NCCS stop dates for aspirin, clopidogrel, warfarin and anticoagulants live on a handwritten annex, not the yellow form. Typical annex: 5 days for clopidogrel. TTSH uses 7 days for Plavix — that is variation, not an error. Follow your annex.',
  'ev.sglt2Gap': 'SGLT2 inhibitors — ask your care team',
  'ev.sglt2GapBody':
    'TTSH stops these 2 days before. The SGH yellow form is silent. Silent is a gap, not permission to continue or to stop.',
  'ev.breakfastAm': 'Morning meds + tiny breakfast, then stop food',
  'ev.breakfastAmBody':
    'Continue usual medications at 6am with a small amount of water. Breakfast only: 2 plain white bread (no kaya/butter/jam) OR 2 plain biscuits. No food after breakfast. Oral meds allowed up to 2 hours before the procedure.',
  'ev.breakfastPm': 'Breakfast only — then no food',
  'ev.breakfastPmBody':
    'SGH form: 2 plain white bread or 2 plain biscuits. The printed form does not clearly spell out afternoon-slot breakfast. Confirm against the handwritten times on your yellow form.',
  'ev.p3pmBody':
    'The SGH yellow form does not print afternoon packet times (F10). Suggested split-dose placement only: take this morning so the last dose can finish 2–5 hours before your procedure. Use the time written on your form if it differs.',
  'ev.p4pmBody':
    'Suggested: start about 5 hours before reporting, finish at least 2 hours before. This is guideline timing, not an SGH printed instruction. Prefer the blanks on your yellow form.',
  'ev.skhP1':
    'No more food after 6pm. Dissolve 1st packet in 150ml water. Then 3 large cups (250ml each) of clear liquid spread over 1 hour 30 minutes.',
  'ev.skhP2': 'Dissolve 2nd packet in 150ml water. Then 3 large cups of clear liquid spread over 1 hour.',
  'ev.skhP1Pm':
    'Dissolve 1st packet in 150ml water, then 3 large cups (250ml) over 1 hour 30 minutes. Afternoon packet times are taken from SKH’s AM/PM generator pattern — confirm on the SKH website if your SMS differs.',
  'ev.skhP2Pm':
    'Dissolve 2nd packet in 150ml water, then 3 large cups over 1 hour. No more fluids 4 hours before reporting.',
  'ev.ttshEve': 'Picoprep — evening dose',
  'ev.ttshEveBody':
    'Follow the 8am–2pm Picoprep PDF you were given. Mix as instructed and drink the clear fluids listed there. This microsite does not replace the slot-specific TTSH PDF.',
  'ev.ttshAm': 'Picoprep — morning dose',
  'ev.ttshAmBody': 'Take the morning dose on the TTSH AM PDF. Finish fluids per that sheet.',
  'ev.ttshPm1': 'Picoprep — first dose (PM slot)',
  'ev.ttshPm1Body':
    'Use the 2pm–5pm Picoprep PDF. TTSH issues a separate sheet per slot — follow that over this summary.',
  'ev.ttshPm2': 'Picoprep — second dose (PM slot)',
  'ev.ttshPm2Body': 'Second dose on the PM PDF, timed to your reporting slot.',
  'ev.cghPegEve': 'PEG-ES — evening portion',
  'ev.cghPegEveBody':
    'CGH uses PEG-ES colonic lavage plus simeticone, not Picoprep. Follow the volumes and times on your CGH brochure. This card is a placeholder so the day structure is visible.',
  'ev.cghBfast': 'Light breakfast, then stop 6 hours before',
  'ev.cghBfastBody':
    'CGH: 1 slice bread or 2 biscuits or a small bowl of plain pasta. BP medications at 6am. No diabetic medication. Stop eating 6 hours before the procedure.',
  'ev.cghPegAm': 'PEG-ES — morning portion',
  'ev.cghPegAmBody': 'Complete the morning PEG as your CGH brochure specifies.',

  'hosp.sgh.stoolAction':
    'SGH form has no stool chart. This guide adapts TTSH’s 6-point scale so you have a way to check. If stool still looks like stages 1–4, call the number below or report 2 hours early.',
  'hosp.sgh.formGap': 'Times for Picoprep are handwritten blanks. Afternoon slots are not printed.',
  'hosp.sgh.c0.label': 'Ambulatory Endoscopy Centre',
  'hosp.sgh.c0.hours': 'Confirm hours with your care team',
  'hosp.sgh.c0.note':
    'The yellow form prints no telephone number (F9). This is the publicly listed AEC line — confirm it at counselling.',
  'hosp.sgh.c1.label': 'SGH general enquiries',
  'hosp.sgh.c1.hours': '24-hour switchboard',
  'hosp.sgh.c1.note': 'Ask to be put through to endoscopy if the AEC line is closed.',
  'hosp.nccs.stoolAction':
    'The SGH/NCCS form has no stool chart. This guide adapts TTSH’s 6-point scale. If stool still looks like stages 1–4, call the number below or report 2 hours early.',
  'hosp.nccs.formGap': 'Medication stop dates live on a separate handwritten annex, not the yellow form.',
  'hosp.nccs.c0.label': 'NCCS main line',
  'hosp.nccs.c0.hours': 'Confirm hours with your care team',
  'hosp.nccs.c0.note': 'The yellow form prints no number. Confirm the endoscopy contact given at counselling.',
  'hosp.nccs.c1.label': 'SGH Ambulatory Endoscopy Centre',
  'hosp.nccs.c1.hours': 'Confirm hours with your care team',
  'hosp.nccs.c1.note':
    'NCCS procedures often run through the SGH endoscopy pathway. Confirm which number applies to you.',
  'hosp.ttsh.stoolAction':
    'If stool still looks like stages 1–4, report 2 hours early and call Endo PACE / the endoscopy centre.',
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
    'SKH uses a 5-point cup chart (no action trigger). Stages 1–3 = not ready. If you are not at “yellow, light, clear”, call SKH before leaving home.',
  'hosp.skh.formGap':
    'SKH already generates a personalised timeline on its website — this microsite mirrors that pattern for demo.',
  'hosp.skh.c0.label': 'Sengkang General Hospital',
  'hosp.skh.c0.hours': 'Confirm hours with your care team',
  'hosp.skh.c0.note':
    'SKH website does not print an after-hours prep hotline. Confirm the number given at counselling.',
  'hosp.cgh.stoolAction':
    'CGH brochure has no stool chart. This guide adapts TTSH’s 6-point scale. If stool still looks like stages 1–4, call during office hours.',
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

