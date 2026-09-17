import type {
  ApiDish,
  ApiDishVerdict,
  ApiFoodClassification,
  ApiIngredient,
  ApiMealPrep,
  ApiMealType,
} from '../lib/api'

/**
 * Hard-coded TTSH meal plan — the dietitian's Singapore-relevant option list.
 *
 * Why this is not coming off the API: dishes_tab has no row for any of these
 * combinations. The TTSH tier holds 58 single-ingredient rows only (White rice,
 * Bee hoon, Chicken, Kopi-O …); every composite dish in the DB sits on the
 * DIETICIAN fallback tier and is a hawker dish ruled on as a whole (Chicken
 * rice, Wanton noodles, Kaya toast), not a prep-safe combination. Until these
 * are seeded, the meal-prep tab reads this file for TTSH and the backend for
 * every other hospital.
 *
 * Shape and wording deliberately mirror the API: ApiDish objects with resolved
 * ApiIngredient rows, verdict derived from the ingredients the same way
 * backend/app/services/food.py _dish_verdict derives it, so DishCard renders
 * these identically to DB-loaded dishes and the swap back to the API is a
 * one-line change in useMealPrep.
 *
 * Ingredient reason wording is copied verbatim from ingredient_tab where a row
 * exists and classifies 'can' on the TTSH tier. Where the sheet-derived DB row
 * disagrees with this list (kaya, butter, kopi/teh with milk, pancakes,
 * waffles, naan, peeled potato, clear jelly, cream desserts are all 'review' or
 * 'cannot' in ingredient_tab), the option list is treated as the ruling and the
 * reason says so — those rows are the ones to re-check before this is seeded.
 */

const SOURCE_DOCUMENT =
  'TTSH low-fibre option list (dietitian-provided; hard-coded pending an ingredient_tab / dishes_tab seed)'

// Shared reason strings. The first four are verbatim ingredient_tab rows; the
// rest are written for options this list clears and the DB has not.
const WHY = {
  refined:
    'Refined white starches are directly listed as permitted in Singapore low-fibre/low-residue guidance.',
  protein: 'Chicken, fish, eggs and seafood are directly permitted in multiple Singapore protocols.',
  tofu: 'Tofu/taukwa are directly listed as allowed by SKH; tofu also appears in NUH/CGH low-residue examples.',
  clear:
    'Water and specified clear/light-coloured drinks are directly permitted during clear-liquid phases, subject to hospital timing and colour rules.',
  pork: 'SKH directly lists pork as allowed during its 3-day low-residue phase.',
  spread:
    'On the TTSH option list as a spread for white bread. Keep it smooth and thin — no coconut flesh, no fruit pieces, no nuts.',
  refinedBake:
    'On the TTSH option list as a plain refined-flour item. Take it plain: no wholemeal, no nuts, seeds, fruit pieces or jam.',
  plainCake:
    'On the TTSH option list as a plain cake. No nuts, seeds, dried fruit, fruit pieces or dark-coloured fillings.',
  custard:
    'Egg-and-milk custards are on the TTSH option list as smooth, residue-free desserts. Plain only — no fruit, no caramel with fruit pieces.',
  drinkWithMilk:
    'TTSH permits coffee and tea with or without milk during its low-fibre phase. Other Singapore sheets are stricter on milk, so follow the TTSH instruction you were given.',
  drinkNoMilk:
    'TTSH permits coffee and tea during its low-fibre phase. Avoid red, purple, blue or dark-coloured drinks if your clinic asks for it.',
  peeledPotato:
    'On the TTSH option list peeled and mashed, without the skin. The skin is the fibrous part, so it comes off before cooking.',
  broth:
    'Clear soup and broth are permitted, strained. No vegetables, noodles, meat pieces or garnish left in the bowl.',
  sauce:
    'Smooth sauces are low in visible residue. Keep the amount small and skip chilli, sambal, sesame and fried shallots.',
  noVeg:
    'On the TTSH option list when taken without the vegetable, herb and garnish sides it usually comes with.',
} as const

type IngredientSeed = {
  /** Defaults to 'can' — every row on this list is one the sheet clears. */
  classification?: ApiFoodClassification
  why: string
}

/** Ingredient catalogue. Insertion order fixes the ids, so keep rows appended. */
const INGREDIENTS: Record<string, IngredientSeed> = {
  // --- Refined starches ---
  'White bread': { why: WHY.refined },
  'White rice': { why: WHY.refined },
  'White porridge': { why: WHY.refined },
  'Bee hoon': { why: WHY.refined },
  'Kway teow': { why: WHY.refined },
  'Rice noodles': { why: WHY.refined },
  'Mee pok': { why: WHY.refined },
  'Mee kia': { why: WHY.refined },
  'Udon noodles': { why: WHY.refined },
  Pasta: { why: WHY.refined },
  'Plain crackers': { why: WHY.refined },
  'Plain biscuits': { why: WHY.refined },
  'Sushi rice': { why: WHY.refined },
  'Chee cheong fun (plain rice roll)': {
    why: 'A plain steamed rice-flour roll is a refined starch. Take it without sesame seeds, fried shallots or sweet sauce.',
  },
  'Idli (steamed rice cake)': {
    why: 'On the TTSH option list plain, without chutney or sambar — those are the fibrous part of the meal.',
  },
  'Dosa (plain rice crepe)': {
    why: 'On the TTSH option list plain, without sambar, chutney or vegetable filling.',
  },
  'Plain naan': { why: WHY.refinedBake },
  'White baguette': { why: WHY.refinedBake },
  'Plain bagel': { why: WHY.refinedBake },
  'Plain flour tortilla': { why: WHY.refinedBake },
  'Plain pancake': { why: WHY.refinedBake },
  'Plain waffle': { why: WHY.refinedBake },
  'Potato (peeled)': { why: WHY.peeledPotato },

  // --- Protein ---
  Egg: { why: WHY.protein },
  'Steamed egg': { why: WHY.protein },
  'Steamed egg custard (chawanmushi)': { why: WHY.protein },
  Chicken: { why: WHY.protein },
  Fish: { why: WHY.protein },
  'Smoked salmon': { why: WHY.protein },
  'Canned tuna': {
    why: 'Plain tuna in water or oil, drained. No sweetcorn, celery or onion mixed into the filling.',
  },
  Fishball: {
    why: 'On the TTSH option list as part of the soup noodle bowl. Plain fishballs only, with the vegetables left out.',
  },
  'Wanton (pork dumpling)': { why: WHY.pork },
  'Minced pork': { why: WHY.pork },
  Tofu: { why: WHY.tofu },
  'Silken tofu': { why: WHY.tofu },
  Taukwa: { why: WHY.tofu },
  'Tau pok': { why: WHY.tofu },
  'Beancurd skin (tau pok / inari)': { why: WHY.tofu },
  'Tau huay (soft beancurd)': {
    why: 'Smooth soy beancurd with plain sugar syrup. No ginkgo nuts, barley, red bean or grass jelly toppings.',
  },

  // --- Spreads, fats, sauces ---
  Kaya: { why: WHY.spread },
  Butter: { why: WHY.spread },
  Syrup: {
    why: 'Plain sugar or maple syrup carries no fibre. Skip fruit compote, jam and anything with seeds or pieces.',
  },
  'Teriyaki sauce': { why: WHY.sauce },

  // --- Soups and drinks ---
  'Clear broth': { why: WHY.broth },
  Water: { why: WHY.clear },
  'Kopi-O': { why: WHY.drinkNoMilk },
  Kopi: { why: WHY.drinkWithMilk },
  'Teh-O': { why: WHY.drinkNoMilk },
  Teh: { why: WHY.drinkWithMilk },
  'Chinese tea': { why: WHY.drinkNoMilk },
  'Green tea': { why: WHY.drinkNoMilk },
  'English breakfast tea': { why: WHY.drinkNoMilk },
  'Soy milk (no pulp)': {
    why: 'On the TTSH option list strained, without pulp. Other Singapore sheets exclude soy milk, so follow the TTSH instruction you were given.',
  },
  'Apple juice (clear, no pulp)': {
    why: 'Clear, light-coloured juice with no pulp is permitted. Cloudy juice and anything with pulp is not.',
  },
  'Isotonic drink': {
    why: 'Light-coloured sports drinks are permitted. Avoid red, purple, blue or brown if your clinic asks for it.',
  },
  'Colourless soft drink': {
    why: 'Colourless soft drinks such as Sprite, 7-Up or cream soda are permitted. Nothing red, purple, blue or dark.',
  },

  // --- Desserts ---
  'Plain sponge cake': { why: WHY.plainCake },
  'Butter cake': { why: WHY.plainCake },
  'Chiffon cake': { why: WHY.plainCake },
  'Swiss roll (plain)': { why: WHY.plainCake },
  'Plain muffin': { why: WHY.plainCake },
  Castella: { why: WHY.plainCake },
  Madeleine: { why: WHY.plainCake },
  Meringue: {
    why: 'Whipped egg white and sugar, nothing fibrous. Plain only — no nuts, no fruit, no dark colouring.',
  },
  'Caramel pudding': { why: WHY.custard },
  Flan: { why: WHY.custard },
  'Panna cotta': { why: WHY.custard },
  'Clear jelly (no fruit)': {
    why: 'Clear jelly with no fruit pieces. Avoid red, purple, blue and dark-coloured jelly — the dye can be mistaken for blood at scope.',
  },
}

type DishSeed = {
  name: string
  meals: ApiMealType[]
  ingredients: (keyof typeof INGREDIENTS)[]
}

const BREAKFAST: ApiMealType[] = ['breakfast']
const MAINS: ApiMealType[] = ['lunch', 'dinner']
const ANY_MEAL: ApiMealType[] = ['breakfast', 'lunch', 'dinner']
const SNACK: ApiMealType[] = ['snack']
const DRINK: ApiMealType[] = ['drink']

/**
 * The option list itself. A dish the sheet lists under two headings is one row
 * with both meal types, the way dishes_tab stores it — the porridges are
 * breakfast and mains, kaya/butter toast is breakfast and tea break.
 */
const DISHES: DishSeed[] = [
  // --- Breakfast ---
  { name: 'Kaya toast + soft-boiled eggs', meals: BREAKFAST, ingredients: ['White bread', 'Kaya', 'Egg'] },
  { name: 'Soft-boiled eggs + white toast', meals: BREAKFAST, ingredients: ['Egg', 'White bread'] },
  {
    name: 'White bread with butter or margarine',
    meals: ['breakfast', 'snack'],
    ingredients: ['White bread', 'Butter'],
  },
  {
    name: 'White bread with smooth kaya',
    meals: ['breakfast', 'snack'],
    ingredients: ['White bread', 'Kaya'],
  },
  {
    name: 'Plain egg sandwich on white bread, no vegetables',
    meals: ANY_MEAL,
    ingredients: ['White bread', 'Egg'],
  },
  { name: 'Scrambled eggs + white toast', meals: BREAKFAST, ingredients: ['Egg', 'White bread'] },
  { name: 'Plain omelette, no vegetables', meals: BREAKFAST, ingredients: ['Egg'] },
  {
    name: 'Plain chee cheong fun, no sesame or garnishes',
    meals: BREAKFAST,
    ingredients: ['Chee cheong fun (plain rice roll)'],
  },
  { name: 'Plain rice porridge / congee', meals: ANY_MEAL, ingredients: ['White porridge'] },
  {
    name: 'Chicken porridge, no vegetables or garnishes',
    meals: ANY_MEAL,
    ingredients: ['White porridge', 'Chicken'],
  },
  {
    name: 'Fish porridge, no vegetables or garnishes',
    meals: ANY_MEAL,
    ingredients: ['White porridge', 'Fish'],
  },
  {
    name: 'Plain idli + egg, no chutney',
    meals: BREAKFAST,
    ingredients: ['Idli (steamed rice cake)', 'Egg'],
  },
  {
    name: 'Plain dosa + egg, no sambar or chutney',
    meals: BREAKFAST,
    ingredients: ['Dosa (plain rice crepe)', 'Egg'],
  },
  {
    name: 'Chawanmushi + white rice',
    meals: BREAKFAST,
    ingredients: ['Steamed egg custard (chawanmushi)', 'White rice'],
  },
  { name: 'Plain jasmine rice + omelette', meals: BREAKFAST, ingredients: ['White rice', 'Egg'] },
  { name: 'White rice + steamed egg', meals: ANY_MEAL, ingredients: ['White rice', 'Steamed egg'] },
  {
    name: 'Plain tortilla + peeled potato + egg',
    meals: BREAKFAST,
    ingredients: ['Plain flour tortilla', 'Potato (peeled)', 'Egg'],
  },
  { name: 'Plain omelette + white baguette', meals: BREAKFAST, ingredients: ['Egg', 'White baguette'] },
  { name: 'Plain white pasta + scrambled egg', meals: BREAKFAST, ingredients: ['Pasta', 'Egg'] },
  { name: 'Plain bee hoon + egg', meals: BREAKFAST, ingredients: ['Bee hoon', 'Egg'] },
  {
    name: 'Plain pancakes with syrup or butter',
    meals: ['breakfast', 'snack'],
    ingredients: ['Plain pancake', 'Syrup', 'Butter'],
  },
  {
    name: 'Plain waffles with syrup or butter',
    meals: ['breakfast', 'snack'],
    ingredients: ['Plain waffle', 'Syrup', 'Butter'],
  },
  { name: 'Plain bagel + smoked salmon', meals: BREAKFAST, ingredients: ['Plain bagel', 'Smoked salmon'] },

  // --- Lunch / dinner ---
  { name: 'Steamed fish + white rice', meals: MAINS, ingredients: ['Fish', 'White rice'] },
  { name: 'Steamed chicken + white rice', meals: MAINS, ingredients: ['Chicken', 'White rice'] },
  {
    name: 'Chicken rice — white rice + skinless chicken, no cucumber or vegetables',
    meals: MAINS,
    ingredients: ['White rice', 'Chicken'],
  },
  {
    name: 'Silken tofu + white rice, no vegetables',
    meals: MAINS,
    ingredients: ['Silken tofu', 'White rice'],
  },
  {
    name: 'Fishball noodle soup, no vegetables',
    meals: MAINS,
    ingredients: ['Mee pok', 'Fishball', 'Clear broth'],
  },
  {
    name: 'Wanton noodle soup, no vegetables',
    meals: MAINS,
    ingredients: ['Mee kia', 'Wanton (pork dumpling)', 'Clear broth'],
  },
  {
    name: 'Soup minced meat noodles, no vegetables or garnishes',
    meals: MAINS,
    ingredients: ['Mee pok', 'Minced pork', 'Clear broth'],
  },
  {
    name: 'Plain kway teow with fish or chicken, no vegetables',
    meals: MAINS,
    ingredients: ['Kway teow', 'Fish', 'Chicken'],
  },
  {
    name: 'Sliced fish bee hoon soup, no vegetables or garnishes',
    meals: MAINS,
    ingredients: ['Bee hoon', 'Fish', 'Clear broth'],
  },
  {
    name: 'Cai png — white rice + steamed egg + fish or chicken, skip the vegetables',
    meals: MAINS,
    ingredients: ['White rice', 'Steamed egg', 'Fish', 'Chicken'],
  },
  {
    name: 'Cai png — white rice + taukwa + tau pok + tofu',
    meals: MAINS,
    ingredients: ['White rice', 'Taukwa', 'Tau pok', 'Tofu'],
  },
  {
    name: 'Chicken tikka + plain naan, no vegetable sides',
    meals: MAINS,
    ingredients: ['Chicken', 'Plain naan'],
  },
  {
    name: 'Plain dosa + grilled chicken',
    meals: MAINS,
    ingredients: ['Dosa (plain rice crepe)', 'Chicken'],
  },
  { name: 'Grilled chicken + mashed potato', meals: MAINS, ingredients: ['Chicken', 'Potato (peeled)'] },
  { name: 'Baked white fish + mashed potato', meals: MAINS, ingredients: ['Fish', 'Potato (peeled)'] },
  { name: 'Grilled saba + white rice', meals: MAINS, ingredients: ['Fish', 'White rice'] },
  {
    name: 'Sushi — white rice with egg, fish or beancurd skin',
    meals: MAINS,
    ingredients: ['Sushi rice', 'Egg', 'Fish', 'Beancurd skin (tau pok / inari)'],
  },
  {
    name: 'Japanese udon with chicken, no vegetables or seaweed',
    meals: MAINS,
    ingredients: ['Udon noodles', 'Chicken', 'Clear broth'],
  },
  {
    name: 'Chicken pho, no bean sprouts or herbs',
    meals: MAINS,
    ingredients: ['Rice noodles', 'Chicken', 'Clear broth'],
  },
  {
    name: 'Chicken teriyaki + white rice, no vegetables',
    meals: MAINS,
    ingredients: ['Chicken', 'Teriyaki sauce', 'White rice'],
  },
  {
    name: 'Plain rice noodles with fish or chicken, no vegetables',
    meals: MAINS,
    ingredients: ['Rice noodles', 'Fish', 'Chicken'],
  },
  {
    name: 'Plain pasta with chicken or fish, no vegetables',
    meals: MAINS,
    ingredients: ['Pasta', 'Chicken', 'Fish'],
  },
  {
    name: 'Tortilla española + white bread, no onion',
    meals: MAINS,
    ingredients: ['Potato (peeled)', 'Egg', 'White bread'],
  },
  {
    name: 'White bread sandwich with egg or chicken, no vegetables',
    meals: MAINS,
    ingredients: ['White bread', 'Egg', 'Chicken'],
  },
  { name: 'Tuna sandwich, no vegetables', meals: MAINS, ingredients: ['White bread', 'Canned tuna'] },

  // --- Tea break / dessert ---
  { name: 'Beancurd / tau huay', meals: SNACK, ingredients: ['Tau huay (soft beancurd)'] },
  { name: 'Plain crackers', meals: SNACK, ingredients: ['Plain crackers'] },
  { name: 'Plain biscuits', meals: SNACK, ingredients: ['Plain biscuits'] },
  { name: 'Plain sponge cake', meals: SNACK, ingredients: ['Plain sponge cake'] },
  { name: 'Butter cake, no nuts or fruit', meals: SNACK, ingredients: ['Butter cake'] },
  { name: 'Plain chiffon cake', meals: SNACK, ingredients: ['Chiffon cake'] },
  { name: 'Plain Swiss roll, no fruit pieces', meals: SNACK, ingredients: ['Swiss roll (plain)'] },
  {
    name: 'Plain muffin, no nuts, seeds or fruit',
    meals: SNACK,
    ingredients: ['Plain muffin'],
  },
  {
    name: 'Egg custard / steamed egg custard',
    meals: SNACK,
    ingredients: ['Steamed egg custard (chawanmushi)'],
  },
  { name: 'Plain castella', meals: SNACK, ingredients: ['Castella'] },
  { name: 'Plain meringue', meals: SNACK, ingredients: ['Meringue'] },
  { name: 'Plain madeleine', meals: SNACK, ingredients: ['Madeleine'] },
  { name: 'Plain caramel pudding', meals: SNACK, ingredients: ['Caramel pudding'] },
  { name: 'Plain flan', meals: SNACK, ingredients: ['Flan'] },
  { name: 'Plain panna cotta', meals: SNACK, ingredients: ['Panna cotta'] },
  {
    name: 'Clear jelly, no fruit — avoid red, purple, blue and dark colours',
    meals: SNACK,
    ingredients: ['Clear jelly (no fruit)'],
  },

  // --- Drinks ---
  { name: 'Plain water', meals: DRINK, ingredients: ['Water'] },
  { name: 'Kopi-O', meals: DRINK, ingredients: ['Kopi-O'] },
  { name: 'Kopi', meals: DRINK, ingredients: ['Kopi'] },
  { name: 'Teh-O', meals: DRINK, ingredients: ['Teh-O'] },
  { name: 'Teh', meals: DRINK, ingredients: ['Teh'] },
  { name: 'Chinese tea', meals: DRINK, ingredients: ['Chinese tea'] },
  { name: 'Green tea', meals: DRINK, ingredients: ['Green tea'] },
  { name: 'English breakfast tea', meals: DRINK, ingredients: ['English breakfast tea'] },
  { name: 'Soy milk, without pulp', meals: DRINK, ingredients: ['Soy milk (no pulp)'] },
  {
    name: 'Clear apple juice, without pulp',
    meals: DRINK,
    ingredients: ['Apple juice (clear, no pulp)'],
  },
  { name: 'Clear soup or clear broth', meals: DRINK, ingredients: ['Clear broth'] },
  {
    name: 'Isotonic / sports drink — avoid red, purple, blue or brown if your clinic asks',
    meals: DRINK,
    ingredients: ['Isotonic drink'],
  },
  {
    name: 'Colourless soft drinks, e.g. Sprite, 7-Up, cream soda',
    meals: DRINK,
    ingredients: ['Colourless soft drink'],
  },
]

const INGREDIENT_ROWS: Record<string, ApiIngredient> = Object.fromEntries(
  Object.entries(INGREDIENTS).map(([name, seed], index) => [
    name,
    {
      id: index + 1,
      name,
      classification: seed.classification ?? 'can',
      classification_reason: seed.why,
      source_hospital: 'TTSH',
      source_document: SOURCE_DOCUMENT,
    } satisfies ApiIngredient,
  ]),
)

/** Same rule as food.py _dish_verdict: any non-'can' ingredient is one to leave out. */
function dishVerdict(ingredients: ApiIngredient[]): [ApiDishVerdict, string[]] {
  if (ingredients.length === 0) return ['review', []]
  const leaveOut = ingredients.filter((i) => i.classification !== 'can')
  if (leaveOut.length === 0) return ['can', []]
  if (ingredients.length - leaveOut.length > leaveOut.length) {
    return ['possible', leaveOut.map((i) => i.name)]
  }
  return ['cannot', []]
}

function toDish(seed: DishSeed, index: number): ApiDish {
  const ingredients = seed.ingredients.map((name) => INGREDIENT_ROWS[name])
  const [verdict, removeIngredients] = dishVerdict(ingredients)
  return {
    id: index + 1,
    name: seed.name,
    meal_type: seed.meals,
    source_hospital: 'TTSH',
    verdict,
    remove_ingredients: removeIngredients,
    ingredients,
  }
}

const ALL_DISHES = DISHES.map(toDish)

/** Sorted by name, the same ordering list_meal_prep applies to DB-loaded dishes. */
function bucket(meal: ApiMealType) {
  return ALL_DISHES.filter((dish) => dish.meal_type.includes(meal)).sort((a, b) =>
    a.name.localeCompare(b.name),
  )
}

export const TTSH_MEAL_PLAN: ApiMealPrep = {
  breakfast: bucket('breakfast'),
  lunch: bucket('lunch'),
  dinner: bucket('dinner'),
  snacks: bucket('snack'),
  drinks: bucket('drink'),
}

/** Hospital codes served from this file instead of the meal-prep endpoint. */
export const HARD_CODED_MEAL_PREP: Record<string, ApiMealPrep> = {
  ttsh: TTSH_MEAL_PLAN,
}
