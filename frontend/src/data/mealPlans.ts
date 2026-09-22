import type { ApiMealPrep } from '../lib/api'
import { SKH_MEAL_PLAN } from './skhMealPlan'
import { TTSH_MEAL_PLAN } from './ttshMealPlan'

/** Hospital codes served from a hard-coded plan instead of the meal-prep endpoint. */
export const HARD_CODED_MEAL_PREP: Record<string, ApiMealPrep> = {
  skh: SKH_MEAL_PLAN,
  ttsh: TTSH_MEAL_PLAN,
}
