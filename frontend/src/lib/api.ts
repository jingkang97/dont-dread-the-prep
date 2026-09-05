/** Base URL for PrepPath FastAPI (no trailing slash). */
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL as string | undefined
)?.replace(/\/$/, '') || 'http://127.0.0.1:8000'

export class ApiError extends Error {
  status: number
  detail: string

  constructor(status: number, detail: string) {
    super(detail)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

async function parseDetail(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { detail?: unknown }
    if (typeof body.detail === 'string') return body.detail
    if (Array.isArray(body.detail)) {
      return body.detail
        .map((item) => {
          if (typeof item === 'string') return item
          if (item && typeof item === 'object' && 'msg' in item) {
            return String((item as { msg: unknown }).msg)
          }
          return JSON.stringify(item)
        })
        .join('; ')
    }
  } catch {
    /* ignore */
  }
  return res.statusText || `Request failed (${res.status})`
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  })
  if (!res.ok) {
    throw new ApiError(res.status, await parseDetail(res))
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export type ApiSlot = 'am' | 'pm'

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

export type ApiProtocolSummary = {
  name: string
  prep_agent: string
  prep_agent_label: string
  diet_days: number
  last_meal: string
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
