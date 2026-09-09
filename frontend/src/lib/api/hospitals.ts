import { apiFetch } from './client'

export type ApiProtocolSummary = {
  name: string
  prep_agent: string
  prep_agent_label: string
  diet_days: number
  milk_in_coffee?: string
  fruit_juice?: string
  listed?: boolean
  reporting_from?: string | null
  reporting_until?: string | null
}

export type ApiHospital = {
  code: string
  short_name: string
  name: string
  cluster: string
  contacts: { label: string; phone: string; hours?: string; note?: string }[]
  protocols: ApiProtocolSummary[]
}

export function listApiHospitals() {
  return apiFetch<ApiHospital[]>('/api/hospitals')
}
