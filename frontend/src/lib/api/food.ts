import { apiFetch } from './client'

export type ApiFoodClassification = 'can' | 'cannot' | 'review'
export type ApiFoodSource = 'SGH' | 'TTSH' | 'CGH' | 'DIETICIAN'
export type ApiMealType = 'breakfast' | 'lunch' | 'dinner' | 'any'

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
  meal_type: ApiMealType
  source_hospital: ApiFoodSource
  verdict: ApiFoodClassification
  ingredients: ApiIngredient[]
}

export type ApiMealPrep = {
  breakfast: ApiDish[]
  lunch: ApiDish[]
  dinner: ApiDish[]
}

export function getApiMealPrep(hospitalCode: string) {
  return apiFetch<ApiMealPrep>(
    `/api/food/meal-prep?hospital_code=${encodeURIComponent(hospitalCode)}`,
  )
}

export type ApiFoodChatStatus = 'ok' | 'multiple' | 'irrelevant' | 'not_found' | 'not_configured'

export type ApiFoodChatResponse = {
  status: ApiFoodChatStatus
  message?: string | null
  matched_query?: string | null
  matched_source?: ApiFoodSource | null
  dish?: ApiDish | null
}

export function postApiFoodChat(query: string, hospitalCode: string) {
  return apiFetch<ApiFoodChatResponse>('/api/food/chat', {
    method: 'POST',
    body: JSON.stringify({ query, hospital_code: hospitalCode }),
  })
}
