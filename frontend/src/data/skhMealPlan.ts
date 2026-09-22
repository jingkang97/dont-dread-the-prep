import type {
  ApiDish,
  ApiDishVerdict,
  ApiIngredient,
  ApiMealPrep,
  ApiMealType,
} from '../lib/api'

/**
 * Hard-coded SKH meal plan — the readable picks out of the SKH sheet and the
 * dietitian baseline.
 *
 * Why this is not coming off the API: list_meal_prep('skh') clears 70 dishes,
 * but most of them are a single sheet ingredient standing in for a dish. A
 * patient opening meal prep was offered "Oyster sauce", "Dark soy sauce",
 * "Mayonnaise" and "Evaporated milk" as lunch, next to four spellings of the
 * same jelly and two of the same apple juice. Nothing there is wrong — they are
 * all genuinely low-residue — but they do not read as meals.
 *
 * So this file keeps the ones that do: 44 dishes, chosen from that cleared set
 * only. Condiments and dairy add-ins are dropped, near-duplicate names are
 * collapsed to one wording, and breakfast keeps the breakfast-shaped items
 * rather than every noodle the sheet allows at any hour.
 *
 * Nothing here is invented. Ingredient ids, reason wording and tier are copied
 * from ingredient_tab as it stands after the Sept 2026 seed, so DishCard renders
 * these exactly as it renders API-served dishes, and dropping the `skh` entry
 * from HARD_CODED_MEAL_PREP puts the hospital back on the endpoint.
 *
 * Milo and Horlicks are on this list because the DIETICIAN rows clear them for
 * the low-residue phase ("stop once clear liquids start"). data/foods.ts carries
 * a stricter no-milk reading for SKH; the sheet rows win here, and that
 * disagreement is worth a dietitian's eye before this ships.
 */

const SOURCE_DOCUMENT =
  'SKH low-residue sheet + dietitian baseline (ingredient_tab, Sept 2026 seed)'

type IngredientSeed = { id: number; why: string; tier: 'SKH' | 'DIETICIAN' }

// Copied from ingredient_tab: id, wording and tier verbatim.
const INGREDIENTS: Record<string, IngredientSeed> = {
  'Agar-agar': {
    id: 1,
    why: 'Only clear agar with no fruit pieces; avoid red, purple, blue or dark colours.',
    tier: 'DIETICIAN',
  },
  'Apple juice': { id: 3, why: 'OK only if clear, pulp-free and strained.', tier: 'DIETICIAN' },
  'Barley water': {
    id: 6,
    why: 'Only if fully strained with no grain left; for clear liquids use diluted, non-cloudy.',
    tier: 'DIETICIAN',
  },
  'Bee hoon': { id: 172, why: 'Noodles are allowed if plain and not wholegrain.', tier: 'SKH' },
  'Chicken': { id: 186, why: 'Lean chicken is allowed and leaves little residue.', tier: 'SKH' },
  'Clear chicken broth': {
    id: 28,
    why: 'Fine if fully strained with no solids.',
    tier: 'DIETICIAN',
  },
  'Clear fish broth': { id: 29, why: 'Fine if fully strained with no solids.', tier: 'DIETICIAN' },
  'Coconut milk': { id: 33, why: 'Acceptable in the low-residue phase.', tier: 'DIETICIAN' },
  'Colourless soft drink': {
    id: 34,
    why: 'Clear fluid that leaves little residue; follow fasting timing.',
    tier: 'DIETICIAN',
  },
  'Dark soy sauce': {
    id: 42,
    why: 'Fine if smooth with no significant visible vegetable pieces.',
    tier: 'DIETICIAN',
  },
  'Egg': { id: 44, why: 'Low-fibre protein that leaves little residue.', tier: 'DIETICIAN' },
  'Fish': { id: 203, why: 'Fish is allowed and leaves little residue.', tier: 'SKH' },
  'Fishball': {
    id: 48,
    why: 'OK only if there are no seeds or vegetable pieces mixed in.',
    tier: 'DIETICIAN',
  },
  'Fishcake': {
    id: 49,
    why: 'OK only if there are no seeds or vegetable pieces mixed in.',
    tier: 'DIETICIAN',
  },
  'Glucose drink': {
    id: 58,
    why: 'Clear fluid that leaves little residue; follow fasting timing.',
    tier: 'DIETICIAN',
  },
  'Honey water': {
    id: 63,
    why: 'Clear fluid that leaves little residue if fully dissolved.',
    tier: 'DIETICIAN',
  },
  'Horlicks': {
    id: 65,
    why: 'OK in the low-residue phase; stop once clear liquids start.',
    tier: 'DIETICIAN',
  },
  'Isotonic drink (light-coloured)': {
    id: 66,
    why: 'Light clear fluid is fine; prefer versions without strong added colour.',
    tier: 'DIETICIAN',
  },
  'Jelly': {
    id: 68,
    why: 'Only clear jelly with no fruit pieces; avoid red, purple, blue or dark colours.',
    tier: 'DIETICIAN',
  },
  'Kway teow': { id: 224, why: 'Noodles are allowed if plain and not wholegrain.', tier: 'SKH' },
  'Luncheon meat': {
    id: 82,
    why: 'OK only if there are no seeds or vegetable pieces mixed in.',
    tier: 'DIETICIAN',
  },
  'Mee kia': { id: 231, why: 'Noodles are allowed if plain and not wholegrain.', tier: 'SKH' },
  'Mee pok': { id: 232, why: 'Noodles are allowed if plain and not wholegrain.', tier: 'SKH' },
  'Mee sua': { id: 233, why: 'Noodles are allowed if plain and not wholegrain.', tier: 'SKH' },
  'Milo': {
    id: 88,
    why: 'OK in the low-residue phase; stop once clear liquids start.',
    tier: 'DIETICIAN',
  },
  'Orange juice': {
    id: 98,
    why: 'Only if fully clear and strained; pulpy versions leave residue — usually avoid.',
    tier: 'DIETICIAN',
  },
  'Pasta': {
    id: 244,
    why: 'Counts as noodles/pasta-style refined starch if not wholegrain.',
    tier: 'SKH',
  },
  'Pear juice': { id: 104, why: 'OK only if clear, pulp-free and strained.', tier: 'DIETICIAN' },
  'Plain biscuits': { id: 250, why: 'Plain biscuits are low in fibre and allowed.', tier: 'SKH' },
  'Potato': { id: 109, why: 'Low-fibre starch if peeled; do not eat the skin.', tier: 'DIETICIAN' },
  'Prawns': { id: 254, why: 'Shellfish such as prawns are allowed.', tier: 'SKH' },
  'Rice cereal': {
    id: 262,
    why: 'Rice cereal is listed as an allowed refined option.',
    tier: 'SKH',
  },
  'Sausage': {
    id: 121,
    why: 'OK only if there are no seeds or vegetable pieces mixed in.',
    tier: 'DIETICIAN',
  },
  'Soy sauce': {
    id: 132,
    why: 'Fine if smooth with no significant visible vegetable pieces.',
    tier: 'DIETICIAN',
  },
  'Squid': { id: 273, why: 'Shellfish/seafood is allowed if plain.', tier: 'SKH' },
  'Sweet potato': {
    id: 140,
    why: 'Only if peeled and well-cooked; some clinics are stricter.',
    tier: 'DIETICIAN',
  },
  'Tau pok': {
    id: 141,
    why: 'Soft soy protein is low-residue if plain and not stuffed with vegetables.',
    tier: 'DIETICIAN',
  },
  'Taukwa': {
    id: 142,
    why: 'Soft soy protein is low-residue if plain and not stuffed with vegetables.',
    tier: 'DIETICIAN',
  },
  'Tofu': {
    id: 147,
    why: 'Soft soy protein is low-residue if plain and not stuffed with vegetables.',
    tier: 'DIETICIAN',
  },
  'Water': {
    id: 153,
    why: 'Clear fluid that leaves no residue; follow fasting stop time.',
    tier: 'DIETICIAN',
  },
  'White bread': { id: 155, why: 'Low in fibre if plain refined white bread.', tier: 'DIETICIAN' },
  'White porridge': {
    id: 290,
    why: 'Low in fibre, so it leaves little residue in the bowel.',
    tier: 'SKH',
  },
  'White rice': {
    id: 291,
    why: 'Low in fibre, so it leaves little residue in the bowel.',
    tier: 'SKH',
  },
  'Yam / taro': {
    id: 164,
    why: 'Only if peeled and well-cooked; some clinics are stricter.',
    tier: 'DIETICIAN',
  },
  'Yellow noodles': {
    id: 298,
    why: 'Noodles are allowed if plain and not wholegrain.',
    tier: 'SKH',
  },
}

type DishSeed = { name: string; meals: ApiMealType[]; ingredients: string[] }

const DISHES: DishSeed[] = [
  // --- Breakfast ---
  { name: 'White porridge', meals: ['breakfast'], ingredients: ['White porridge'] },
  { name: 'Plain toast', meals: ['breakfast'], ingredients: ['White bread'] },
  { name: 'Soft-boiled eggs', meals: ['breakfast'], ingredients: ['Egg', 'Soy sauce'] },
  { name: 'Rice cereal', meals: ['breakfast', 'snack'], ingredients: ['Rice cereal'] },
  { name: 'Plain biscuits', meals: ['breakfast', 'snack'], ingredients: ['Plain biscuits'] },
  { name: 'Bee hoon', meals: ['breakfast', 'lunch', 'dinner'], ingredients: ['Bee hoon'] },
  { name: 'Mee sua', meals: ['breakfast', 'lunch', 'dinner'], ingredients: ['Mee sua'] },
  { name: 'White rice', meals: ['breakfast', 'lunch', 'dinner'], ingredients: ['White rice'] },
  { name: 'Potato', meals: ['breakfast', 'lunch', 'dinner'], ingredients: ['Potato'] },
  { name: 'Sweet potato', meals: ['breakfast', 'lunch', 'dinner'], ingredients: ['Sweet potato'] },

  // --- Lunch and dinner ---
  { name: 'Chicken', meals: ['lunch', 'dinner'], ingredients: ['Chicken'] },
  { name: 'Fish', meals: ['lunch', 'dinner'], ingredients: ['Fish'] },
  { name: 'Prawns', meals: ['lunch', 'dinner'], ingredients: ['Prawns'] },
  { name: 'Squid', meals: ['lunch', 'dinner'], ingredients: ['Squid'] },
  { name: 'Plain steamed egg', meals: ['lunch', 'dinner'], ingredients: ['Egg', 'Soy sauce'] },
  { name: 'Tofu', meals: ['lunch', 'dinner'], ingredients: ['Tofu'] },
  { name: 'Taukwa', meals: ['lunch', 'dinner'], ingredients: ['Taukwa'] },
  { name: 'Tau pok', meals: ['lunch', 'dinner'], ingredients: ['Tau pok'] },
  { name: 'Fishball', meals: ['lunch', 'dinner'], ingredients: ['Fishball'] },
  { name: 'Fishcake', meals: ['lunch', 'dinner'], ingredients: ['Fishcake'] },
  { name: 'Luncheon meat', meals: ['lunch', 'dinner'], ingredients: ['Luncheon meat'] },
  { name: 'Sausage', meals: ['lunch', 'dinner'], ingredients: ['Sausage'] },
  {
    name: 'Chap chye',
    meals: ['lunch', 'dinner'],
    ingredients: ['White rice', 'Tofu', 'Dark soy sauce'],
  },
  { name: 'Kway teow', meals: ['lunch', 'dinner'], ingredients: ['Kway teow'] },
  { name: 'Mee kia', meals: ['lunch', 'dinner'], ingredients: ['Mee kia'] },
  { name: 'Mee pok', meals: ['lunch', 'dinner'], ingredients: ['Mee pok'] },
  { name: 'Yellow noodles', meals: ['lunch', 'dinner'], ingredients: ['Yellow noodles'] },
  { name: 'Pasta', meals: ['lunch', 'dinner'], ingredients: ['Pasta'] },
  { name: 'Yam / taro', meals: ['lunch', 'dinner'], ingredients: ['Yam / taro'] },
  {
    name: 'Clear broth',
    meals: ['lunch', 'dinner', 'drink'],
    ingredients: ['Clear chicken broth', 'Clear fish broth'],
  },

  // --- Snacks ---
  { name: 'Agar-agar', meals: ['snack'], ingredients: ['Agar-agar'] },
  { name: 'Jelly', meals: ['snack'], ingredients: ['Jelly'] },
  {
    name: 'Bubur cha cha',
    meals: ['snack'],
    ingredients: ['Sweet potato', 'Yam / taro', 'Coconut milk'],
  },

  // --- Drinks ---
  { name: 'Water', meals: ['drink'], ingredients: ['Water'] },
  { name: 'Barley water', meals: ['drink'], ingredients: ['Barley water'] },
  { name: 'Apple juice (clear, no pulp)', meals: ['drink'], ingredients: ['Apple juice'] },
  { name: 'Pear juice (clear, no pulp)', meals: ['drink'], ingredients: ['Pear juice'] },
  { name: 'Orange juice', meals: ['drink'], ingredients: ['Orange juice'] },
  { name: 'Honey water', meals: ['drink'], ingredients: ['Honey water'] },
  { name: 'Glucose drink', meals: ['drink'], ingredients: ['Glucose drink'] },
  {
    name: 'Isotonic drink (light-coloured)',
    meals: ['drink'],
    ingredients: ['Isotonic drink (light-coloured)'],
  },
  { name: 'Colourless soft drink', meals: ['drink'], ingredients: ['Colourless soft drink'] },
  { name: 'Milo', meals: ['drink'], ingredients: ['Milo'] },
  { name: 'Horlicks', meals: ['drink'], ingredients: ['Horlicks'] },
]

const INGREDIENT_ROWS: Record<string, ApiIngredient> = Object.fromEntries(
  Object.entries(INGREDIENTS).map(([name, seed]) => [
    name,
    {
      id: seed.id,
      name,
      classification: 'can',
      classification_reason: seed.why,
      source_hospital: seed.tier,
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
    source_hospital: 'SKH',
    // Every dish here was picked from the cleared set, so none is a hard_no.
    hard_no: false,
    hard_no_reason: '',
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

export const SKH_MEAL_PLAN: ApiMealPrep = {
  breakfast: bucket('breakfast'),
  lunch: bucket('lunch'),
  dinner: bucket('dinner'),
  snacks: bucket('snack'),
  drinks: bucket('drink'),
}
