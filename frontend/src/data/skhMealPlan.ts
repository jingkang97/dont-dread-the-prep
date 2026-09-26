import type {
  ApiDish,
  ApiDishVerdict,
  ApiFoodClassification,
  ApiIngredient,
  ApiMealPrep,
  ApiMealType,
} from '../lib/api'
import type { Cuisine } from './cuisine'

/**
 * Hard-coded SKH meal plan — the same dietitian option list the TTSH plan uses,
 * with the wording made hospital-neutral.
 *
 * Copied from ttshMealPlan.ts on 23 Sep 2026 and kept as its own file rather
 * than an alias: the two lists are expected to diverge once SKH's own sheet is
 * read properly, and a shared object would make that divergence a refactor
 * instead of an edit.
 *
 * What changed in the copy: every patient-facing reason that named TTSH now
 * reads "the low-fibre option list". Nothing else about a ruling was touched
 * on the copy — same dishes, same ingredients, same classifications.
 *
 * Why this is not coming off the API: the SKH tier in dishes_tab clears mostly
 * single sheet ingredients standing in for dishes (Oyster sauce, Mee pok,
 * Evaporated milk), which do not read as meals. See mealPlans.ts.
 *
 * Shape mirrors the API: ApiDish objects with resolved ApiIngredient rows and
 * the verdict derived the way backend/app/services/food.py _dish_verdict
 * derives it, so DishCard renders these identically to DB-loaded dishes and the
 * swap back to the endpoint is one line in mealPlans.ts.
 *
 * Reconciled against ingredient_tab on 23 Sep 2026: Butter, Plain naan, Plain
 * pancake and Plain waffle are 'review' here (not 'can') because SKH's own
 * sheet does not clear them either — the ghee/oil used is the open question,
 * same as ingredient_tab. Kopi, Kopi-O, Teh, Teh-O, Soy milk (no pulp) and
 * Potato (peeled) are 'cannot' here because SKH's sheet excludes milk drinks,
 * dark coffee/tea, soy milk and potato skin outright — TTSH's own sheet
 * differs on the drinks and soy milk, which is why ttshMealPlan.ts keeps them
 * 'can'. This is a real SKH/TTSH difference, not a copy-paste gap.
 */

const SOURCE_DOCUMENT =
  'Low-fibre option list (dietitian-provided, hospital-neutral wording; hard-coded pending an ingredient_tab / dishes_tab seed)'

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
    'On the low-fibre option list as a spread for white bread. Keep it smooth and thin — no coconut flesh, no fruit pieces, no nuts.',
  refinedBake:
    'On the low-fibre option list as a plain refined-flour item. Take it plain: no wholemeal, no nuts, seeds, fruit pieces or jam.',
  plainCake:
    'On the low-fibre option list as a plain cake. No nuts, seeds, dried fruit, fruit pieces or dark-coloured fillings.',
  custard:
    'Egg-and-milk custards are on the low-fibre option list as smooth, residue-free desserts. Plain only — no fruit, no caramel with fruit pieces.',
  broth:
    'Clear soup and broth are permitted, strained. No vegetables, noodles, meat pieces or garnish left in the bowl.',
  sauce:
    'Smooth sauces are low in visible residue. Keep the amount small and skip chilli, sambal, sesame and fried shallots.',
  noVeg:
    'On the low-fibre option list when taken without the vegetable, herb and garnish sides it usually comes with.',
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
    why: 'On the low-fibre option list plain, without chutney or sambar — those are the fibrous part of the meal.',
  },
  'Dosa (plain rice crepe)': {
    why: 'On the low-fibre option list plain, without sambar, chutney or vegetable filling.',
  },
  'Plain naan': {
    classification: 'review',
    why: 'Refined flour is low in fibre, but the ghee or oil used can matter.',
  },
  'White baguette': { why: WHY.refinedBake },
  'Plain bagel': { why: WHY.refinedBake },
  'Plain flour tortilla': { why: WHY.refinedBake },
  'Plain pancake': {
    classification: 'review',
    why: 'Refined flour is low in fibre, but the ghee or oil used can matter.',
  },
  'Plain waffle': {
    classification: 'review',
    why: 'Refined flour is low in fibre, but the ghee or oil used can matter.',
  },
  'Potato (peeled)': {
    classification: 'cannot',
    why: 'Low-fibre starch if peeled; do not eat the skin.',
  },

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
    why: 'On the low-fibre option list as part of the soup noodle bowl. Plain fishballs only, with the vegetables left out.',
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
  Butter: {
    classification: 'review',
    why: 'Fat itself is low in fibre, but how much is used in cooking is hard to judge.',
  },
  Syrup: {
    why: 'Plain sugar or maple syrup carries no fibre. Skip fruit compote, jam and anything with seeds or pieces.',
  },
  'Teriyaki sauce': { why: WHY.sauce },

  // --- Soups and drinks ---
  'Clear broth': { why: WHY.broth },
  Water: { why: WHY.clear },
  'Kopi-O': {
    classification: 'cannot',
    why: 'Dark coffee/tea is avoided because it can affect the bowel view.',
  },
  Kopi: {
    classification: 'cannot',
    why: 'Coffee/tea is avoided; milk drinks are also not allowed.',
  },
  'Teh-O': {
    classification: 'cannot',
    why: 'Dark coffee/tea is avoided because it can affect the bowel view.',
  },
  Teh: {
    classification: 'cannot',
    why: 'Coffee/tea is avoided; milk drinks are also not allowed.',
  },
  'Soy milk (no pulp)': {
    classification: 'cannot',
    why: "Soy milk is avoided on this hospital's fluid list.",
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
  cuisine: Cuisine
  /** Shown under the name on the card; the title stays the name alone. */
  note?: string
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
  { name: 'Kaya toast + soft-boiled eggs', cuisine: 'chinese', meals: BREAKFAST, ingredients: ['White bread', 'Kaya', 'Egg'] },
  { name: 'Soft-boiled eggs + white toast', cuisine: 'chinese', meals: BREAKFAST, ingredients: ['Egg', 'White bread'] },
  {
    name: 'White bread + butter', cuisine: 'western', note: 'Butter or margarine',
    meals: ['breakfast', 'snack'],
    ingredients: ['White bread', 'Butter'],
  },
  {
    name: 'White bread + kaya', cuisine: 'chinese', note: 'Smooth kaya only',
    meals: ['breakfast', 'snack'],
    ingredients: ['White bread', 'Kaya'],
  },
  {
    name: 'Plain egg sandwich', cuisine: 'western', note: 'On white bread, no vegetables',
    meals: ANY_MEAL,
    ingredients: ['White bread', 'Egg'],
  },
  { name: 'Scrambled eggs + white toast', cuisine: 'western', meals: BREAKFAST, ingredients: ['Egg', 'White bread'] },
  { name: 'Plain omelette', cuisine: 'western', note: 'No vegetables', meals: BREAKFAST, ingredients: ['Egg'] },
  {
    name: 'Plain chee cheong fun', cuisine: 'chinese', note: 'No sesame or garnishes',
    meals: BREAKFAST,
    ingredients: ['Chee cheong fun (plain rice roll)'],
  },
  { name: 'Plain rice porridge', cuisine: 'chinese', note: 'Also called congee', meals: ANY_MEAL, ingredients: ['White porridge'] },
  {
    name: 'Chicken porridge', cuisine: 'chinese', note: 'No vegetables or garnishes',
    meals: ANY_MEAL,
    ingredients: ['White porridge', 'Chicken'],
  },
  {
    name: 'Fish porridge', cuisine: 'chinese', note: 'No vegetables or garnishes',
    meals: ANY_MEAL,
    ingredients: ['White porridge', 'Fish'],
  },
  {
    name: 'Plain idli + egg', cuisine: 'indian', note: 'No chutney',
    meals: BREAKFAST,
    ingredients: ['Idli (steamed rice cake)', 'Egg'],
  },
  {
    name: 'Plain dosa + egg', cuisine: 'indian', note: 'No sambar or chutney',
    meals: BREAKFAST,
    ingredients: ['Dosa (plain rice crepe)', 'Egg'],
  },
  {
    name: 'Chawanmushi + white rice', cuisine: 'japanese',
    meals: BREAKFAST,
    ingredients: ['Steamed egg custard (chawanmushi)', 'White rice'],
  },
  { name: 'Plain jasmine rice + omelette', cuisine: 'general', meals: BREAKFAST, ingredients: ['White rice', 'Egg'] },
  { name: 'White rice + steamed egg', cuisine: 'general', meals: ANY_MEAL, ingredients: ['White rice', 'Steamed egg'] },
  {
    name: 'Plain tortilla + potato + egg', cuisine: 'western', note: 'Potato peeled',
    meals: BREAKFAST,
    ingredients: ['Plain flour tortilla', 'Potato (peeled)', 'Egg'],
  },
  { name: 'Plain omelette + white baguette', cuisine: 'western', meals: BREAKFAST, ingredients: ['Egg', 'White baguette'] },
  { name: 'Plain white pasta + scrambled egg', cuisine: 'western', meals: BREAKFAST, ingredients: ['Pasta', 'Egg'] },
  { name: 'Plain bee hoon + egg', cuisine: 'chinese', meals: BREAKFAST, ingredients: ['Bee hoon', 'Egg'] },
  {
    name: 'Plain pancakes', cuisine: 'western', note: 'With syrup or butter',
    meals: ['breakfast', 'snack'],
    ingredients: ['Plain pancake', 'Syrup', 'Butter'],
  },
  {
    name: 'Plain waffles', cuisine: 'western', note: 'With syrup or butter',
    meals: ['breakfast', 'snack'],
    ingredients: ['Plain waffle', 'Syrup', 'Butter'],
  },
  { name: 'Plain bagel + smoked salmon', cuisine: 'western', meals: BREAKFAST, ingredients: ['Plain bagel', 'Smoked salmon'] },

  // --- Lunch / dinner ---
  { name: 'Steamed fish + white rice', cuisine: 'chinese', meals: MAINS, ingredients: ['Fish', 'White rice'] },
  { name: 'Steamed chicken + white rice', cuisine: 'chinese', meals: MAINS, ingredients: ['Chicken', 'White rice'] },
  {
    name: 'Chicken rice', cuisine: 'chinese', note: 'White rice + skinless chicken, no cucumber or vegetables',
    meals: MAINS,
    ingredients: ['White rice', 'Chicken'],
  },
  {
    name: 'Silken tofu + white rice', cuisine: 'chinese', note: 'No vegetables',
    meals: MAINS,
    ingredients: ['Silken tofu', 'White rice'],
  },
  {
    name: 'Fishball noodle soup', cuisine: 'chinese', note: 'No vegetables',
    meals: MAINS,
    ingredients: ['Mee pok', 'Fishball', 'Clear broth'],
  },
  {
    name: 'Wanton noodle soup', cuisine: 'chinese', note: 'No vegetables',
    meals: MAINS,
    ingredients: ['Mee kia', 'Wanton (pork dumpling)', 'Clear broth'],
  },
  {
    name: 'Soup minced meat noodles', cuisine: 'chinese', note: 'No vegetables or garnishes',
    meals: MAINS,
    ingredients: ['Mee pok', 'Minced pork', 'Clear broth'],
  },
  {
    name: 'Plain kway teow', cuisine: 'chinese', note: 'With fish or chicken, no vegetables',
    meals: MAINS,
    ingredients: ['Kway teow', 'Fish', 'Chicken'],
  },
  {
    name: 'Sliced fish bee hoon soup', cuisine: 'chinese', note: 'No vegetables or garnishes',
    meals: MAINS,
    ingredients: ['Bee hoon', 'Fish', 'Clear broth'],
  },
  {
    name: 'Cai png + egg and fish', cuisine: 'chinese', note: 'White rice + steamed egg + fish or chicken, skip the vegetables',
    meals: MAINS,
    ingredients: ['White rice', 'Steamed egg', 'Fish', 'Chicken'],
  },
  {
    name: 'Cai png + beancurd', cuisine: 'chinese', note: 'White rice + taukwa + tau pok + tofu',
    meals: MAINS,
    ingredients: ['White rice', 'Taukwa', 'Tau pok', 'Tofu'],
  },
  {
    name: 'Chicken tikka + plain naan', cuisine: 'indian', note: 'No vegetable sides',
    meals: MAINS,
    ingredients: ['Chicken', 'Plain naan'],
  },
  {
    name: 'Plain dosa + grilled chicken', cuisine: 'indian',
    meals: MAINS,
    ingredients: ['Dosa (plain rice crepe)', 'Chicken'],
  },
  { name: 'Grilled chicken + mashed potato', cuisine: 'western', meals: MAINS, ingredients: ['Chicken', 'Potato (peeled)'] },
  { name: 'Baked white fish + mashed potato', cuisine: 'western', meals: MAINS, ingredients: ['Fish', 'Potato (peeled)'] },
  { name: 'Grilled saba + white rice', cuisine: 'japanese', meals: MAINS, ingredients: ['Fish', 'White rice'] },
  {
    name: 'Sushi', cuisine: 'japanese', note: 'White rice with egg, fish or beancurd skin',
    meals: MAINS,
    ingredients: ['Sushi rice', 'Egg', 'Fish', 'Beancurd skin (tau pok / inari)'],
  },
  {
    name: 'Udon with chicken', cuisine: 'japanese', note: 'No vegetables or seaweed',
    meals: MAINS,
    ingredients: ['Udon noodles', 'Chicken', 'Clear broth'],
  },
  {
    name: 'Chicken pho', cuisine: 'vietnamese', note: 'No bean sprouts or herbs',
    meals: MAINS,
    ingredients: ['Rice noodles', 'Chicken', 'Clear broth'],
  },
  {
    name: 'Chicken teriyaki + white rice', cuisine: 'japanese', note: 'No vegetables',
    meals: MAINS,
    ingredients: ['Chicken', 'Teriyaki sauce', 'White rice'],
  },
  {
    name: 'Plain rice noodles', cuisine: 'general', note: 'With fish or chicken, no vegetables',
    meals: MAINS,
    ingredients: ['Rice noodles', 'Fish', 'Chicken'],
  },
  {
    name: 'Plain pasta', cuisine: 'western', note: 'With chicken or fish, no vegetables',
    meals: MAINS,
    ingredients: ['Pasta', 'Chicken', 'Fish'],
  },
  {
    name: 'Tortilla española + white bread', cuisine: 'western', note: 'No onion',
    meals: MAINS,
    ingredients: ['Potato (peeled)', 'Egg', 'White bread'],
  },
  {
    name: 'White bread sandwich', cuisine: 'western', note: 'With egg or chicken, no vegetables',
    meals: MAINS,
    ingredients: ['White bread', 'Egg', 'Chicken'],
  },
  { name: 'Tuna sandwich', cuisine: 'western', note: 'No vegetables', meals: MAINS, ingredients: ['White bread', 'Canned tuna'] },

  // --- Tea break / dessert ---
  { name: 'Tau huay', cuisine: 'chinese', note: 'Plain beancurd dessert', meals: SNACK, ingredients: ['Tau huay (soft beancurd)'] },
  { name: 'Plain crackers', cuisine: 'general', meals: SNACK, ingredients: ['Plain crackers'] },
  { name: 'Plain biscuits', cuisine: 'general', meals: SNACK, ingredients: ['Plain biscuits'] },
  { name: 'Plain sponge cake', cuisine: 'western', meals: SNACK, ingredients: ['Plain sponge cake'] },
  { name: 'Butter cake', cuisine: 'western', note: 'No nuts or fruit', meals: SNACK, ingredients: ['Butter cake'] },
  { name: 'Plain chiffon cake', cuisine: 'western', meals: SNACK, ingredients: ['Chiffon cake'] },
  { name: 'Plain Swiss roll', cuisine: 'western', note: 'No fruit pieces', meals: SNACK, ingredients: ['Swiss roll (plain)'] },
  {
    name: 'Plain muffin', cuisine: 'western', note: 'No nuts, seeds or fruit',
    meals: SNACK,
    ingredients: ['Plain muffin'],
  },
  {
    name: 'Egg custard', cuisine: 'chinese', note: 'Steamed, plain',
    meals: SNACK,
    ingredients: ['Steamed egg custard (chawanmushi)'],
  },
  { name: 'Plain castella', cuisine: 'japanese', meals: SNACK, ingredients: ['Castella'] },
  { name: 'Plain meringue', cuisine: 'western', meals: SNACK, ingredients: ['Meringue'] },
  { name: 'Plain madeleine', cuisine: 'western', meals: SNACK, ingredients: ['Madeleine'] },
  { name: 'Plain caramel pudding', cuisine: 'western', meals: SNACK, ingredients: ['Caramel pudding'] },
  { name: 'Plain flan', cuisine: 'western', meals: SNACK, ingredients: ['Flan'] },
  { name: 'Plain panna cotta', cuisine: 'western', meals: SNACK, ingredients: ['Panna cotta'] },
  {
    name: 'Clear jelly', cuisine: 'general', note: 'No fruit; avoid red, purple, blue and dark colours',
    meals: SNACK,
    ingredients: ['Clear jelly (no fruit)'],
  },

  // --- Drinks ---
  { name: 'Plain water', cuisine: 'general', meals: DRINK, ingredients: ['Water'] },
  { name: 'Kopi-O', cuisine: 'general', meals: DRINK, ingredients: ['Kopi-O'] },
  { name: 'Kopi', cuisine: 'general', meals: DRINK, ingredients: ['Kopi'] },
  { name: 'Teh-O', cuisine: 'general', meals: DRINK, ingredients: ['Teh-O'] },
  { name: 'Teh', cuisine: 'general', meals: DRINK, ingredients: ['Teh'] },
  { name: 'Soy milk', cuisine: 'chinese', note: 'Without pulp', meals: DRINK, ingredients: ['Soy milk (no pulp)'] },
  {
    name: 'Clear apple juice', cuisine: 'general', note: 'Without pulp',
    meals: DRINK,
    ingredients: ['Apple juice (clear, no pulp)'],
  },
  { name: 'Clear soup or broth', cuisine: 'general', meals: DRINK, ingredients: ['Clear broth'] },
  {
    name: 'Isotonic / sports drink', cuisine: 'general', note: 'Avoid red, purple, blue or brown if your clinic asks',
    meals: DRINK,
    ingredients: ['Isotonic drink'],
  },
  {
    name: 'Colourless soft drinks', cuisine: 'general', note: 'e.g. Sprite, 7-Up, cream soda',
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
      source_hospital: 'SKH',
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
    note: seed.note,
    cuisine: seed.cuisine,
    meal_type: seed.meals,
    source_hospital: 'SKH',
    verdict,
    // The offline plan carries no hard_no dishes: every dish here is judged
    // from its ingredients alone.
    hard_no: false,
    hard_no_reason: '',
    remove_ingredients: removeIngredients,
    ingredients,
  }
}

const ALL_DISHES = DISHES.map(toDish)

/**
 * Same rule backend/app/services/food.py list_meal_prep applies: only a dish
 * where every ingredient clears as 'can' is a recommendation. A 'possible' or
 * 'cannot' dish here would show a recommended dish with a red-X ingredient in
 * it — meal prep is "what can I eat", not "here's the breakdown of everything
 * on the list". Sorted by name, the same ordering list_meal_prep applies.
 */
function bucket(meal: ApiMealType) {
  return ALL_DISHES.filter((dish) => dish.meal_type.includes(meal) && dish.verdict === 'can').sort(
    (a, b) => a.name.localeCompare(b.name),
  )
}

export const SKH_MEAL_PLAN: ApiMealPrep = {
  breakfast: bucket('breakfast'),
  lunch: bucket('lunch'),
  dinner: bucket('dinner'),
  snacks: bucket('snack'),
  drinks: bucket('drink'),
}
