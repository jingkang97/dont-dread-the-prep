import type { ApiHospital } from '../lib/api/hospitals'
import { hospitalAccent, type HospitalId } from './hospitals'

export const PICKER_CLUSTERS = ['SingHealth', 'NHG', 'NUHS'] as const
export type PickerCluster = (typeof PICKER_CLUSTERS)[number]

export type PickerHospital = {
  key: string
  short: string
  name: string
  cluster: PickerCluster
  prep: string
  accent: string
  hospitalId: HospitalId
}

function clusterOf(value: string): PickerCluster {
  return (PICKER_CLUSTERS as readonly string[]).includes(value)
    ? (value as PickerCluster)
    : 'SingHealth'
}

/** Live onboarding list: whatever `/api/hospitals` returns. */
export function pickerHospitalsFromApi(rows: ApiHospital[]): PickerHospital[] {
  return rows.map((h) => ({
    key: h.code,
    short: h.short_name,
    name: h.name,
    cluster: clusterOf(h.cluster),
    prep: h.protocols[0]?.prep_agent_label ?? '',
    accent: hospitalAccent(h.code, h.cluster),
    hospitalId: h.code,
  }))
}

export function clustersIn(list: PickerHospital[]) {
  return PICKER_CLUSTERS.filter((c) => list.some((h) => h.cluster === c))
}

export function matchHospital(h: PickerHospital, q: string, extra = '') {
  const n = q.trim().toLowerCase()
  if (!n) return true
  return `${h.short} ${h.name} ${h.cluster} ${h.prep} ${extra}`.toLowerCase().includes(n)
}
