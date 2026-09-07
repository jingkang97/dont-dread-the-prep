export type HospitalId = string
export type Slot = 'am' | 'pm'

export type Contact = {
  label: string
  phone: string
  hours?: string
  note?: string
}

/** Picker chip colours — not in the hospitals table. */
const ACCENT_BY_CODE: Record<string, string> = {
  sgh: '#c4921a',
  nccs: '#1b7a6e',
  ttsh: '#1b4d8c',
}

const ACCENT_BY_CLUSTER: Record<string, string> = {
  SingHealth: '#c4921a',
  NHG: '#1b4d8c',
  NUHS: '#0b6e4f',
}

const DEFAULT_ACCENT = '#64748b'

export function hospitalAccent(code: string, cluster?: string) {
  return ACCENT_BY_CODE[code] ?? ACCENT_BY_CLUSTER[cluster ?? ''] ?? DEFAULT_ACCENT
}

export function formatPhone(phone: string) {
  if (phone.length === 8) return `${phone.slice(0, 4)} ${phone.slice(4)}`
  return phone
}

export function telHref(phone: string) {
  return `tel:+65${phone}`
}
