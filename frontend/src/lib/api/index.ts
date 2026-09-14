export { API_BASE_URL, ApiError, apiFetch } from './client'
export type { ApiSlot } from './types'
export { listApiHospitals } from './hospitals'
export type {
  ApiHospital,
  ApiProtocolSummary,
  ApiStoolReady,
  ApiStoolScale,
  ApiStoolScaleStage,
} from './hospitals'
export { defaultProtocolName } from './onboarding'
export {
  createApiSession,
  getApiSession,
  patchApiSession,
  getVapidPublicKey,
  subscribeApiPush,
  unsubscribeApiPush,
} from './sessions'
export type {
  ApiSession,
  ApiSessionCreate,
  ApiSessionUpdate,
} from './sessions'
export { getApiTimeline } from './timeline'
export type {
  ApiEventKind,
  ApiTimeline,
  ApiTimelineEvent,
} from './timeline'
export { getApiMealPrep, postApiFoodChat } from './food'
export type {
  ApiDish,
  ApiFoodChatResponse,
  ApiFoodChatStatus,
  ApiFoodClassification,
  ApiFoodSource,
  ApiIngredient,
  ApiMealPrep,
  ApiMealType,
} from './food'
