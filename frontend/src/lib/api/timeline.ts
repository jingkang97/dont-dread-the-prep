import { apiFetch } from './client'
import type { ApiSlot } from './types'

export type ApiEventKind = 'diet' | 'prep' | 'med' | 'meal' | 'fast' | 'arrive' | 'stool'

export type ApiTimelineEvent = {
  id: string
  at: string
  kind: ApiEventKind
  title: string
  detail: string
  tentative: boolean
  agent: string | null
  prep_image_label: string | null
  sort_order: number
}

export type ApiTimeline = {
  public_code: string
  protocol_name: string
  source_label: string
  version_id: number
  version_label: string
  procedure_date: string
  slot: ApiSlot
  reporting_time: string
  events: ApiTimelineEvent[]
}

export function getApiTimeline(publicCode: string) {
  return apiFetch<ApiTimeline>(
    `/api/sessions/${encodeURIComponent(publicCode)}/timeline`,
  )
}
