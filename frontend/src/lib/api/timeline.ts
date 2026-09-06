import { apiFetch } from './client'
import type { ApiSlot } from './types'

export type ApiEventKind = 'diet' | 'med' | 'dose' | 'meal' | 'fast' | 'arrive' | 'check' | 'gap'

export type ApiTimelineEvent = {
  id: string
  at: string
  kind: ApiEventKind
  title: string
  detail: string
  tentative: boolean
  dose_label: string | null
  mix_volume_ml: number | null
  follow_fluid_ml: number | null
  agent: string | null
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
