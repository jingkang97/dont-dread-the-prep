/** Stool/contact, food-system, and rule-title copy. Hospital source lines stay in English. */

export const CLINICAL_EN = {
  'hosp.sgh.stoolAction':
    'SGH form has no stool chart. This guide uses the Bristol stool scale so you can compare appearance.',
  'hosp.sgh.formGap': 'Times for Picoprep are handwritten blanks. Afternoon slots are not printed.',
  'hosp.nccs.stoolAction':
    'The SGH/NCCS form has no stool chart. This guide uses the Bristol stool scale so you can compare appearance.',
  'hosp.nccs.formGap': 'Medication stop dates live on a separate handwritten annex, not the yellow form.',
  'hosp.skh.stoolAction':
    'SKH’s form has a 5-point cup chart. This guide uses the Bristol stool scale so you can compare appearance.',
  'hosp.skh.formGap':
    'SKH already generates a personalised timeline on its website — this microsite mirrors that pattern for demo.',
  'hosp.cgh.stoolAction':
    'CGH brochure has no stool chart. This guide uses the Bristol stool scale so you can compare appearance.',
  'hosp.cgh.formGap': 'Prep agent is PEG, not Picoprep. Day-of meds: BP at 6am; no diabetic medication.',

  'food.empty': 'Type a food or drink — for example, “can I have prata?”',
  'food.deflectTitle': 'Ask your care team',
  'food.deflectBody':
    'That sits outside the signed food ruleset. This assistant only classifies foods and a few named medication flags against your hospital’s sheet. It will not invent an answer.',
  'food.gapTitle': 'Not in the ruleset',
  'food.gapBody':
    '“{q}” is not a named line on your hospital sheet, and no approved rule classifies it. Ask your care team — this is recorded as a gap, not a guess.',
  'food.symptomTitle': 'This is not an emergency line',
  'food.symptomBody':
    'If you feel unwell, call your hospital’s number from the Contacts tab, or 995. This site cannot triage symptoms.',
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
