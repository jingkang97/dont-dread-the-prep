import { apiFetch } from './client'

export type ApiFoodClassification = 'can' | 'cannot' | 'review'
export type ApiDishVerdict = ApiFoodClassification | 'possible'
/** Matches DB food_source; SGH kept for legacy ingredient/dish rows. */
export type ApiFoodSource = 'SGH' | 'TTSH' | 'CGH' | 'DIETICIAN'
export type ApiMealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink'

export type ApiIngredient = {
  id: number
  name: string
  classification: ApiFoodClassification
  classification_reason: string
  source_hospital: ApiFoodSource
  source_document: string
}

export type ApiDish = {
  id: number
  name: string
  meal_type: ApiMealType[]
  source_hospital: ApiFoodSource
  verdict: ApiDishVerdict
  remove_ingredients: string[]
  ingredients: ApiIngredient[]
}

export type ApiMealPrep = {
  breakfast: ApiDish[]
  lunch: ApiDish[]
  dinner: ApiDish[]
  snacks: ApiDish[]
  drinks: ApiDish[]
}

export function getApiMealPrep(hospitalCode: string) {
  return apiFetch<ApiMealPrep>(
    `/api/food/meal-prep?hospital_code=${encodeURIComponent(hospitalCode)}`,
  )
}

export type ApiFoodChatStatus =
  | 'ok'
  | 'multiple'
  | 'irrelevant'
  | 'not_found'
  | 'not_configured'
  | 'choices'

export type ApiDishChoice = {
  id: number
  name: string
}

export type ApiFoodChatResponse = {
  status: ApiFoodChatStatus
  message?: string | null
  matched_query?: string | null
  matched_source?: ApiFoodSource | null
  dish?: ApiDish | null
  choices?: ApiDishChoice[] | null
}

export function postApiFoodChat(query: string, hospitalCode: string) {
  return apiFetch<ApiFoodChatResponse>('/api/food/chat', {
    method: 'POST',
    body: JSON.stringify({ query, hospital_code: hospitalCode }),
  })
}

export function getApiDish(dishId: number) {
  return apiFetch<ApiDish>(`/api/food/dish/${dishId}`)
}
