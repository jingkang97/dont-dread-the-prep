import {
  HOSPITAL_LIST,
  isMvpHospitalId,
  type Hospital,
  type HospitalId,
} from './hospitals'

export type PickerSize = 'now' | 'large'

export const PICKER_CLUSTERS = ['SingHealth', 'NHG', 'NUHS'] as const
export type PickerCluster = (typeof PICKER_CLUSTERS)[number]

/**
 * Catalog row for the onboarding hospital picker.
 * - `hospitalId` set → real PrepPath hospital (from `hospitals.ts`)
 * - no `hospitalId` → preview-only extra (NUH, KTPH, …)
 * Session create still requires MVP ids via `canStartSession` / `selectableIds`.
 */
export type PickerHospital = {
  key: string
  short: string
  name: string
  cluster: PickerCluster
  prep: string
  accent: string
  hospitalId?: HospitalId
}

function fromReal(h: Hospital): PickerHospital {
  const cluster = h.cluster as PickerCluster
  return {
    key: h.id,
    short: h.short,
    name: h.name,
    cluster,
    prep: h.prepAgentLabel,
    accent: h.accent,
    hospitalId: h.id,
  }
}

function extra(
  key: string,
  short: string,
  name: string,
  cluster: PickerCluster,
  prep: string,
  accent: string,
): PickerHospital {
  return { key, short, name, cluster, prep, accent }
}

const REAL = HOSPITAL_LIST.map(fromReal)

/** Enough sites to feel like 8–15 without leaving the public clusters. */
const MID_EXTRA: PickerHospital[] = [
  extra('nuh', 'NUH', 'National University Hospital', 'NUHS', 'Picoprep · check your booklet', '#003d7c'),
  extra('ntfgh', 'NTFGH', 'Ng Teng Fong General Hospital', 'NUHS', 'PEG · check your booklet', '#0b6e4f'),
  extra('ktph', 'KTPH', 'Khoo Teck Puat Hospital', 'NHG', 'Picoprep · check your booklet', '#1a6b9a'),
  extra('wh', 'WH', 'Woodlands Health', 'NHG', 'Picoprep · check your booklet', '#4a6670'),
  extra('kkh', 'KKH', 'KK Women’s and Children’s Hospital', 'SingHealth', 'Paediatric / adult booklet', '#c45c7a'),
  extra('ah', 'AH', 'Alexandra Hospital', 'NUHS', 'Picoprep · check your booklet', '#6b4f3a'),
  extra('snec', 'SNEC', 'Singapore National Eye Centre', 'SingHealth', 'Not an endoscopy sheet', '#2f5d8c'),
]

/** Pushes past one screen so search-first is the only sane empty state. */
const LARGE_EXTRA: PickerHospital[] = [
  extra('nhcs', 'NHCS', 'National Heart Centre Singapore', 'SingHealth', 'Not an endoscopy sheet', '#8b1e3f'),
  extra('imh', 'IMH', 'Institute of Mental Health', 'NHG', 'Check your booklet', '#5c4d7a'),
  extra('ych', 'YCH', 'Yishun Community Hospital', 'NHG', 'Step-down · not a scope sheet', '#3d6b6b'),
  extra('jch', 'JCH', 'Jurong Community Hospital', 'NUHS', 'Step-down · not a scope sheet', '#3f6b4a'),
  extra('och', 'OCH', 'Outram Community Hospital', 'SingHealth', 'Step-down · not a scope sheet', '#7a5a2e'),
  extra('skch', 'SKCH', 'Sengkang Community Hospital', 'SingHealth', 'Step-down · not a scope sheet', '#c46a2e'),
  extra('bvh', 'BVH', 'Bright Vision Hospital', 'SingHealth', 'Community · not a scope sheet', '#4a7a5c'),
  extra('peh', 'PEH', 'Punggol Endoscopy Hub (preview)', 'SingHealth', 'No signed sheet in this build', '#5a6e7a'),
]

export function hospitalsFor(size: PickerSize): PickerHospital[] {
  if (size === 'now') return REAL
  return [...REAL, ...MID_EXTRA, ...LARGE_EXTRA]
}

export function clustersIn(list: PickerHospital[]) {
  return PICKER_CLUSTERS.filter((c) => list.some((h) => h.cluster === c))
}

export function matchHospital(h: PickerHospital, q: string) {
  const n = q.trim().toLowerCase()
  if (!n) return true
  return `${h.short} ${h.name} ${h.cluster} ${h.prep}`.toLowerCase().includes(n)
}

/**
 * Whether picking this row should call onboarding `onPick` / create a session.
 * Aligns with `MVP_HOSPITAL_IDS` in `hospitals.ts` and Onboarding’s `selectableIds`.
 */
export function canStartSession(
  h: PickerHospital,
  selectableIds?: readonly HospitalId[] | null,
): h is PickerHospital & { hospitalId: HospitalId } {
  if (!h.hospitalId) return false
  if (selectableIds == null) return isMvpHospitalId(h.hospitalId)
  return selectableIds.includes(h.hospitalId)
}
