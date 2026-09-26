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
 * exists and classifies 'can' on the TTSH tier.
 *
 * Reconciled against ingredient_tab on 23 Sep 2026: Butter, Plain naan, Plain
 * pancake and Plain waffle are 'review' here too (not 'can') — the TTSH sheet
 * does not clear the ghee/oil used any more than ingredient_tab does. Potato
 * (peeled) is 'cannot' here — TTSH's sheet excludes potato skin outright, the
 * same call ingredient_tab's TTSH tier makes. Kopi, Kopi-O, Teh, Teh-O and Soy
 * milk stay 'can' here: TTSH's own sheet permits milk drinks and soy milk
 * where SKH's does not, so skhMealPlan.ts has those as 'cannot' instead — a
 * real hospital difference, not a copy-paste gap.
 */

const SOURCE_DOCUMENT =
  'Low-fibre option list (dietitian-provided; hard-coded pending an ingredient_tab / dishes_tab seed)'

// Shared reason strings. The first four are verbatim ingredient_tab rows; the
// rest are written for options this list clears and the DB has not.
const WHY = {
  refined:
    'Refined white starches are low in fibre and allowed.',
  protein: 'Chicken, fish, eggs and seafood are allowed.',
  tofu: 'Tofu and taukwa are allowed.',
  clear:
    'Water and clear, light-coloured drinks are allowed. Follow your timing instructions.',
  pork: 'Lean pork is allowed.',
  spread:
    'Allowed as a thin spread on white bread. No coconut flesh, fruit pieces or nuts.',
  refinedBake:
    'Allowed plain. No wholemeal, nuts, seeds, fruit pieces or jam.',
  plainCake:
    'Allowed plain. No nuts, seeds, dried fruit or dark fillings.',
  custard:
    'Smooth custards are allowed. Plain only, no fruit.',
  drinkWithMilk:
    'Coffee and tea are allowed, with or without milk.',
  drinkNoMilk:
    'Coffee and tea are allowed.',
  broth:
    'Clear, strained soup is allowed. No vegetables, noodles or meat pieces.',
  sauce:
    'Small amounts are fine. Skip chilli, sambal, sesame and fried shallots.',
  noVeg:
    'Allowed without the vegetables, herbs and garnish.',
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
    why: 'Allowed plain, without sesame, fried shallots or sweet sauce.',
  },
  'Idli (steamed rice cake)': {
    why: 'Allowed plain, without chutney or sambar.',
  },
  'Dosa (plain rice crepe)': {
    why: 'Allowed plain, without sambar, chutney or vegetable filling.',
  },
  'Plain naan': {
    classification: 'review',
    why: 'Low in fibre, but check how much oil or ghee is used.',
  },
  'White baguette': { why: WHY.refinedBake },
  'Plain bagel': { why: WHY.refinedBake },
  'Plain flour tortilla': { why: WHY.refinedBake },
  'Plain pancake': {
    classification: 'review',
    why: 'Low in fibre, but check how much oil or ghee is used.',
  },
  'Plain waffle': {
    classification: 'review',
    why: 'Low in fibre, but check how much oil or ghee is used.',
  },
  'Potato (peeled)': {
    classification: 'cannot',
    why: 'Not allowed. Avoid potato, including the skin.',
  },

  // --- Protein ---
  Egg: { why: WHY.protein },
  'Steamed egg': { why: WHY.protein },
  'Steamed egg custard (chawanmushi)': { why: WHY.protein },
  Chicken: { why: WHY.protein },
  Fish: { why: WHY.protein },
  'Smoked salmon': { why: WHY.protein },
  'Canned tuna': {
    why: 'Plain, drained tuna is allowed. No sweetcorn, celery or onion.',
  },
  Fishball: {
    why: 'Plain fishballs are allowed. Leave out the vegetables.',
  },
  'Wanton (pork dumpling)': { why: WHY.pork },
  'Minced pork': { why: WHY.pork },
  Tofu: { why: WHY.tofu },
  'Silken tofu': { why: WHY.tofu },
  Taukwa: { why: WHY.tofu },
  'Tau pok': { why: WHY.tofu },
  'Beancurd skin (tau pok / inari)': { why: WHY.tofu },
  'Tau huay (soft beancurd)': {
    why: 'Allowed with plain syrup. No ginkgo, barley, red bean or grass jelly.',
  },

  // --- Spreads, fats, sauces ---
  Kaya: { why: WHY.spread },
  Butter: {
    classification: 'review',
    why: 'Low in fibre, but use only a little.',
  },
  Syrup: {
    why: 'Plain syrup is allowed. No jam or fruit pieces.',
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
    why: 'Allowed if strained, with no pulp.',
  },
  'Apple juice (clear, no pulp)': {
    why: 'Clear juice with no pulp is allowed.',
  },
  'Isotonic drink': {
    why: 'Light-coloured sports drinks are allowed. Avoid red, purple or blue.',
  },
  'Colourless soft drink': {
    why: 'Colourless soft drinks like Sprite or 7-Up are allowed.',
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
    why: 'Allowed plain. No nuts, fruit or dark colouring.',
  },
  'Caramel pudding': { why: WHY.custard },
  Flan: { why: WHY.custard },
  'Panna cotta': { why: WHY.custard },
  'Clear jelly (no fruit)': {
    why: 'Clear jelly with no fruit is allowed. Avoid red, purple or blue jelly.',
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
  { name: 'Chinese tea', cuisine: 'chinese', meals: DRINK, ingredients: ['Chinese tea'] },
  { name: 'Green tea', cuisine: 'chinese', meals: DRINK, ingredients: ['Green tea'] },
  { name: 'English breakfast tea', cuisine: 'western', meals: DRINK, ingredients: ['English breakfast tea'] },
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
    note: seed.note,
    cuisine: seed.cuisine,
    meal_type: seed.meals,
    source_hospital: 'TTSH',
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

export const TTSH_MEAL_PLAN: ApiMealPrep = {
  breakfast: bucket('breakfast'),
  lunch: bucket('lunch'),
  dinner: bucket('dinner'),
  snacks: bucket('snack'),
  drinks: bucket('drink'),
}
