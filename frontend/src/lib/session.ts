import type { HospitalId, Slot } from '../data/hospitals'
import { defaultReporting, type SessionInput } from './timeline'
import { clearFoodChat } from './foodChat'
import { clearTimelineCache } from './timelineCache'
import { clearTimelineUi } from './timelineUi'
import { clearFoodChatUi } from './foodChatUi'
import {
  ApiError,
  createApiSession,
  getApiSession,
  patchApiSession,
  type ApiSession,
} from './api'

export type Screen = 'onboarding' | 'home' | 'timeline' | 'food' | 'stool' | 'reminders'

export type ReminderPlanItem = {
  key: string
  title: string
  copyKey: string
  delayLabel: string
  at: string | null
  sent: boolean
}

export type PrepSession = SessionInput & {
  id: string
  hospitalShort: string
  firstName?: string
  createdAt: string
  waOptIn: boolean
  pushOptIn: boolean
  telegramLinked: boolean
  reminderMode?: 'demo' | 'live'
  reminderPlan?: ReminderPlanItem[]
  protocolName?: string
}

export function cleanFirstName(raw?: string) {
  const name = (raw ?? '').trim().replace(/\s+/g, ' ')
  if (!name) return undefined
  return name.slice(0, 24)
}

const KEY = 'preppath.session.v1'
const COOKIE = 'preppath_session'
const PARAM = 'p'
const CODE_PARAM = 's'
const GO_PARAM = 'go'

function normalizeTime(value: string) {
  return value.length >= 5 ? value.slice(0, 5) : value
}

function toApiTime(hm: string) {
  return hm.length === 5 ? `${hm}:00` : hm
}

export function fromApiSession(row: ApiSession): PrepSession {
  return {
    id: row.public_code,
    hospitalId: row.hospital_code,
    hospitalShort: row.hospital_short_name,
    date: row.procedure_date,
    slot: row.slot,
    reportingTime: normalizeTime(row.reporting_time),
    firstName: row.first_name ?? undefined,
    createdAt: row.created_at,
    waOptIn: row.wa_opt_in,
    pushOptIn: Boolean(row.push_opt_in),
    telegramLinked: Boolean(row.telegram_linked),
    reminderMode: row.reminder_mode === 'demo' ? 'demo' : 'live',
    reminderPlan: (row.reminder_plan ?? []).map((item) => ({
      key: item.key,
      title: item.title,
      copyKey: item.copy_key,
      delayLabel: item.delay_label,
      at: item.at,
      sent: Boolean(item.sent),
    })),
    protocolName: row.protocol_name,
  }
}

function parseSession(raw: unknown): PrepSession | null {
  if (!raw || typeof raw !== 'object') return null
  const s = raw as Partial<PrepSession>
  if (!s.id || !s.date || !s.reportingTime || !s.createdAt) return null
  if (s.slot !== 'am' && s.slot !== 'pm') return null
  if (!s.hospitalId) return null
  return {
    id: String(s.id),
    hospitalId: String(s.hospitalId),
    hospitalShort: s.hospitalShort ? String(s.hospitalShort) : String(s.hospitalId).toUpperCase(),
    date: String(s.date),
    slot: s.slot,
    reportingTime: normalizeTime(String(s.reportingTime)),
    firstName: cleanFirstName(s.firstName),
    createdAt: String(s.createdAt),
    waOptIn: Boolean(s.waOptIn),
    pushOptIn: Boolean(s.pushOptIn),
    telegramLinked: Boolean(s.telegramLinked),
    reminderMode: s.reminderMode === 'demo' ? 'demo' : 'live',
    reminderPlan: Array.isArray(s.reminderPlan) ? s.reminderPlan : undefined,
    protocolName: s.protocolName ? String(s.protocolName) : undefined,
  }
}

function encodeSession(session: PrepSession) {
  const bytes = new TextEncoder().encode(JSON.stringify(session))
  let bin = ''
  for (const byte of bytes) bin += String.fromCharCode(byte)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function decodeSession(token: string): PrepSession | null {
  try {
    const pad = token.length % 4 === 0 ? '' : '='.repeat(4 - (token.length % 4))
    const bin = atob(token.replace(/-/g, '+').replace(/_/g, '/') + pad)
    const json = new TextDecoder().decode(Uint8Array.from(bin, (ch) => ch.charCodeAt(0)))
    return parseSession(JSON.parse(json))
  } catch {
    return null
  }
}

function sessionFromUrl(): PrepSession | null {
  const query = new URLSearchParams(window.location.search).get(PARAM)
  if (query) return decodeSession(query)
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, '')).get(PARAM)
  return hash ? decodeSession(hash) : null
}

function publicCodeFromUrl(): string | null {
  const raw = new URLSearchParams(window.location.search).get(CODE_PARAM)
  if (!raw) return null
  const code = raw.trim().toUpperCase()
  return /^[A-Z2-9]{4}$/.test(code) ? code : null
}

export function screenFromGo(go: unknown): Screen | null {
  if (go === 'timeline' || go === 'food' || go === 'stool' || go === 'reminders' || go === 'home') {
    return go
  }
  return null
}

export function screenFromUrl(): Screen | null {
  return screenFromGo(new URLSearchParams(window.location.search).get(GO_PARAM))
}

function sessionFromCookie(): PrepSession | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`))
  if (!match?.[1]) return null
  try {
    return parseSession(JSON.parse(decodeURIComponent(match[1])))
  } catch {
    return decodeSession(decodeURIComponent(match[1]))
  }
}

function writeCookie(session: PrepSession | null) {
  const secure = window.location.protocol === 'https:' ? ';Secure' : ''
  if (!session) {
    document.cookie = `${COOKIE}=;Path=/;Max-Age=0;SameSite=Lax${secure}`
    return
  }
  document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(session))};Path=/;Max-Age=31536000;SameSite=Lax${secure}`
}

function writeUrl(session: PrepSession | null) {
  const url = new URL(window.location.href)
  if (session) url.searchParams.set(PARAM, encodeSession(session))
  else url.searchParams.delete(PARAM)
  const next = `${url.pathname}${url.search}${url.hash}`
  const now = `${window.location.pathname}${window.location.search}${window.location.hash}`
  if (next !== now) history.replaceState(history.state, '', next)
}

function publishManifest(session: PrepSession | null) {
  const start = session ? `/?s=${encodeURIComponent(session.id)}` : '/'
  const manifest = {
    name: 'PrepPath',
    short_name: 'PrepPath',
    id: '/',
    description: 'No-install colonoscopy prep companion.',
    display: 'standalone',
    orientation: 'portrait',
    theme_color: '#f2f2f7',
    background_color: '#f2f2f7',
    start_url: start,
    scope: '/',
    launch_handler: { client_mode: ['focus-existing', 'navigate-existing', 'auto'] },
    icons: [
      { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png', purpose: 'any' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  }
  const blob = URL.createObjectURL(new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' }))
  let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'manifest'
    document.head.appendChild(link)
  }
  const prev = link.href
  link.href = blob
  if (prev.startsWith('blob:')) URL.revokeObjectURL(prev)
}

function persistEverywhere(session: PrepSession | null) {
  if (session) localStorage.setItem(KEY, JSON.stringify(session))
  else localStorage.removeItem(KEY)
  writeCookie(session)
  writeUrl(session)
  publishManifest(session)
}

export function loadSession(): PrepSession | null {
  try {
    const fromStore = (() => {
      const raw = localStorage.getItem(KEY)
      return raw ? parseSession(JSON.parse(raw)) : null
    })()
    const existing = sessionFromUrl() ?? sessionFromCookie() ?? fromStore
    if (existing) persistEverywhere(existing)
    else publishManifest(null)
    return existing
  } catch {
    return null
  }
}

export function saveSession(session: PrepSession) {
  persistEverywhere(session)
}

export function clearSession() {
  persistEverywhere(null)
  clearFoodChat()
  clearFoodChatUi()
  clearTimelineUi()
  clearTimelineCache()
}

/** Refresh from API using cached public_code; keep cache if offline; clear if 404. */
export async function hydrateSession(): Promise<PrepSession | null> {
  const fromLink = publicCodeFromUrl()
  if (fromLink) {
    try {
      const fresh = fromApiSession(await getApiSession(fromLink))
      saveSession(fresh)
      return fresh
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        return loadSession()
      }
    }
  }

  const cached = loadSession()
  if (!cached?.id) return null

  try {
    const fresh = fromApiSession(await getApiSession(cached.id))
    saveSession(fresh)
    return fresh
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      clearSession()
      return null
    }
    return cached
  }
}

export async function createSession(partial: {
  hospitalId: HospitalId
  date: string
  slot: Slot
  reportingTime?: string
  firstName?: string
  protocolName?: string
}): Promise<PrepSession> {
  const reportingTime = partial.reportingTime || defaultReporting(partial.slot)
  const firstName = cleanFirstName(partial.firstName)
  const row = await createApiSession({
    hospital_code: partial.hospitalId,
    procedure_date: partial.date,
    slot: partial.slot,
    reporting_time: toApiTime(reportingTime),
    first_name: firstName,
    protocol_name: partial.protocolName,
  })
  const session = fromApiSession(row)
  saveSession(session)
  return session
}

export async function markWaOptIn(session: PrepSession): Promise<PrepSession> {
  try {
    const row = await patchApiSession(session.id, { wa_opt_in: true })
    const next = fromApiSession(row)
    saveSession(next)
    return next
  } catch {
    const next = { ...session, waOptIn: true }
    saveSession(next)
    return next
  }
}

export async function updateAppointment(
  session: PrepSession,
  patch: { date: string; slot: Slot; reportingTime: string },
): Promise<PrepSession> {
  const row = await patchApiSession(session.id, {
    procedure_date: patch.date,
    slot: patch.slot,
    reporting_time: toApiTime(patch.reportingTime),
  })
  const next = fromApiSession(row)
  saveSession(next)
  clearTimelineUi()
  clearTimelineCache(session.id)
  return next
}

/** Telegram bot username without @. Set VITE_TELEGRAM_BOT_USERNAME after BotFather. */
export const TELEGRAM_BOT =
  import.meta.env.VITE_TELEGRAM_BOT_USERNAME?.replace(/^@/, '').trim() ||
  'PrepPathBot'

export function telegramStartHref(sessionId: string) {
  return `https://t.me/${TELEGRAM_BOT}?start=${encodeURIComponent(sessionId)}`
}
