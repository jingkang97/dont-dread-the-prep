import { apiFetch } from './client'
import type { ApiSlot } from './types'

export type ApiSession = {
  public_code: string
  hospital_code: string
  hospital_short_name: string
  protocol_name: string
  procedure_date: string
  slot: ApiSlot
  reporting_time: string
  first_name: string | null
  wa_opt_in: boolean
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
  wa_opt_in?: boolean
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
