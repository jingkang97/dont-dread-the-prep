import { apiFetch } from './client'
import type { ApiSlot } from './types'

export type ApiReminderPlanItem = {
  key: string
  title: string
  copy_key: string
  delay_label: string
  at: string | null
  sent: boolean
}

export type ApiSession = {
  public_code: string
  hospital_code: string
  hospital_short_name: string
  protocol_name: string
  procedure_date: string
  slot: ApiSlot
  reporting_time: string
  first_name: string | null
  push_opt_in: boolean
  telegram_linked?: boolean
  reminder_mode?: 'demo' | 'live'
  reminder_plan?: ApiReminderPlanItem[]
  created_at: string
}

export type ApiSessionCreate = {
  hospital_code: string
  procedure_date: string
  slot: ApiSlot
  reporting_time?: string
  protocol_name?: string
  first_name?: string
}

export type ApiSessionUpdate = {
  procedure_date?: string
  slot?: ApiSlot
  reporting_time?: string
  first_name?: string | null
}

export function createApiSession(body: ApiSessionCreate) {
  return apiFetch<ApiSession>('/api/sessions', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function getApiSession(publicCode: string) {
  return apiFetch<ApiSession>(`/api/sessions/${encodeURIComponent(publicCode)}`)
}

export function patchApiSession(publicCode: string, body: ApiSessionUpdate) {
  return apiFetch<ApiSession>(`/api/sessions/${encodeURIComponent(publicCode)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function getVapidPublicKey() {
  return apiFetch<{ public_key: string }>('/api/push/vapid-public-key')
}

export function subscribeApiPush(
  publicCode: string,
  body: { endpoint: string; keys: { p256dh: string; auth: string } },
) {
  return apiFetch<void>(`/api/sessions/${encodeURIComponent(publicCode)}/push`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function unsubscribeApiPush(publicCode: string) {
  return apiFetch<void>(`/api/sessions/${encodeURIComponent(publicCode)}/push`, {
    method: 'DELETE',
  })
}
