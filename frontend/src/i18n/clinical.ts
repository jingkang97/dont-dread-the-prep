/** Stool/contact, food-system, and rule-title copy. */

export const CLINICAL_EN = {
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
  'food.tabMealPrep': 'Meal prep',
  'food.tabChat': 'Check a food',
  'food.mealLead': 'Dishes {hospital} clears for every ingredient.',
  'food.mealBreakfast': 'Breakfast',
  'food.mealLunchDinner': 'Lunch / Dinner',
  'food.mealSnacks': 'Snacks',
  'food.mealDrinks': 'Drinks',
  'food.mealLoadingTitle': 'Checking the ruleset…',
  'food.mealLoadingHint': 'Matching dishes against {hospital} first, then the dietitian baseline.',
  'food.mealEmpty': 'No fully-clear dishes for this meal yet. Check a food for a specific item.',
  'food.thinking': 'Checking…',
  'food.multipleTitle': 'One food at a time',
  'food.irrelevantTitle': 'Not a food question',
  'food.notFoundTitle': 'Not in the ruleset yet',
  'food.notConfiguredTitle': 'Chat unavailable',
  'food.choicesTitle': 'Which one did you mean?',
  'food.possibleNote': 'Possible if you leave out {ingredients}.',
  'food.showIngredients': 'Show ingredients',
  'food.hideIngredients': 'Hide ingredients',
  'food.networkError': 'Could not reach the food service. Check your connection and try again.',
  'food.suggest.chickenRice': 'Chicken rice',
  'food.suggest.kopiMilk': 'Kopi with milk',
  'food.suggest.appleJuice': 'Apple juice',
  'food.suggest.milo': 'Milo',
  'food.suggest.whiteBread': 'White bread',
  'food.suggest.thosai': 'Thosai',
  'food.suggest.ckt': 'Char kway teow',
} as const
