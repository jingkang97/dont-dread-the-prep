import type { ApiCuisine } from '../lib/api'
import type { StringKey } from '../i18n/strings'

/**
 * Cuisine a dish belongs to, for the meal-prep filter.
 *
 * Not a clinical property and not on the API: dishes_tab has no cuisine column,
 * so only the hard-coded plans set it. 'general' is the honest bucket for the
 * dishes that belong to no kitchen in particular — white rice, a boiled potato,
 * a glass of water — rather than a guess at their origin.
 */
export type Cuisine = ApiCuisine

/** Chip order. A cuisine with no dish in the current meal is not shown. */
export const CUISINES: { id: Cuisine; label: StringKey }[] = [
  { id: 'general', label: 'food.cuisineGeneral' },
  { id: 'chinese', label: 'food.cuisineChinese' },
  { id: 'malay', label: 'food.cuisineMalay' },
  { id: 'indian', label: 'food.cuisineIndian' },
  { id: 'japanese', label: 'food.cuisineJapanese' },
  { id: 'vietnamese', label: 'food.cuisineVietnamese' },
  { id: 'western', label: 'food.cuisineWestern' },
]
