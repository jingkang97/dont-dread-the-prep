import { apiFetch } from './client'

export type ApiProtocolSummary = {
  name: string
  prep_agent: string
  prep_agent_label: string
  listed?: boolean
  reporting_from?: string | null
  reporting_until?: string | null
}

export type ApiStoolReady = 'not' | 'almost' | 'ready'

export type ApiStoolScaleStage = {
  n: number
  name: string
  look?: string | null
  ready: ApiStoolReady | null
  color?: string | null
  photo?: string | null
}

export type ApiStoolScale = {
  key: string
  show_ready_badges: boolean
  not_ready_action?: string | null
  stages: ApiStoolScaleStage[]
}

export type ApiHospital = {
  code: string
  short_name: string
  name: string
  cluster: string
  contacts: { label: string; phone: string; hours?: string; note?: string }[]
  protocols: ApiProtocolSummary[]
  stool_scale: ApiStoolScale
}

export function listApiHospitals() {
  return apiFetch<ApiHospital[]>('/api/hospitals')
}
