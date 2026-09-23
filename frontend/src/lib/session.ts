import type { HospitalId, Slot } from '../data/hospitals'
import { defaultReporting, type SessionInput } from './timeline'
import { clearFoodChat } from './foodChat'
import { clearTimelineCache, loadTimeline, timelineCacheKey, getCachedTimeline } from './timelineCache'
import { clearTimelineUi } from './timelineUi'
import { clearFoodChatUi } from './foodChatUi'
import { isLang } from '../i18n/strings'
import { readStoredLang, syncLangManifest } from '../i18n/persist'
import {
  ApiError,
  createApiSession,
  getApiSession,
  patchApiSession,
  unsubscribeApiPush,
  unsubscribeApiTelegram,
  type ApiSession,
} from './api'

export type Screen = 'onboarding' | 'home' | 'timeline' | 'food' | 'stool' | 'contacts' | 'reminders'

export type ReminderPlanItem = {
  key: string
  title: string
  copyKey: string
  delayLabel: string
  body?: string
  at: string | null
  sent: boolean
}

export type PrepSession = SessionInput & {
  id: string
  hospitalShort: string
  firstName?: string
  createdAt: string
  pushOptIn: boolean
  telegramLinked: boolean
  reminderPlan?: ReminderPlanItem[]
  protocolName?: string
  preferredLang?: 'en' | 'zh' | 'ms' | 'ta'
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
const REPLACE_KEY = 'preppath.replace_session'

function normalizeTime(value: string) {
  return value.length >= 5 ? value.slice(0, 5) : value
}

/** `HH:MM` from the picker → FastAPI `time` (`HH:MM:SS`). */
function toApiTime(hm: string) {
  return hm.length === 5 ? `${hm}:00` : hm
}

function storedPreferredLang(): 'en' | 'zh' | 'ms' | 'ta' {
  return readStoredLang()
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
    pushOptIn: Boolean(row.push_opt_in),
    telegramLinked: Boolean(row.telegram_linked),
    reminderPlan: (row.reminder_plan ?? []).map((item) => ({
      key: item.key,
      title: item.title,
      copyKey: item.copy_key,
      delayLabel: item.delay_label,
      body: item.body,
      at: item.at,
      sent: Boolean(item.sent),
    })),
    protocolName: row.protocol_name,
    preferredLang: row.preferred_lang,
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
    pushOptIn: Boolean(s.pushOptIn),
    telegramLinked: Boolean(s.telegramLinked),
    reminderPlan: Array.isArray(s.reminderPlan) ? s.reminderPlan : undefined,
    protocolName: s.protocolName ? String(s.protocolName) : undefined,
    preferredLang: s.preferredLang && isLang(s.preferredLang) ? s.preferredLang : undefined,
  }
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
  if (
    go === 'timeline' ||
    go === 'food' ||
    go === 'stool' ||
    go === 'contacts' ||
    go === 'reminders' ||
    go === 'home'
  ) {
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
  // Keep the cookie small; iOS drops >4KB and reminderPlan is only needed live from the API.
  const { reminderPlan: _plan, ...slim } = session
  document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(slim))};Path=/;Max-Age=31536000;SameSite=Lax${secure}`
}

function writeUrl(session: PrepSession | null) {
  const url = new URL(window.location.href)
  url.searchParams.delete(PARAM)
  if (session) url.searchParams.set(CODE_PARAM, session.id)
  else url.searchParams.delete(CODE_PARAM)
  const next = `${url.pathname}${url.search}${url.hash}`
  const now = `${window.location.pathname}${window.location.search}${window.location.hash}`
  if (next !== now) history.replaceState(history.state, '', next)
}

function publishManifest(sessionId: string | null) {
  syncLangManifest(sessionId)
}

export function syncSessionManifest() {
  syncLangManifest(publicCodeFromUrl() ?? sessionIdFromLocal() ?? null)
}

function sessionIdFromLocal(): string | null {
  try {
    const raw = localStorage.getItem(KEY)
    const id = raw ? (JSON.parse(raw) as { id?: unknown }).id : null
    return typeof id === 'string' ? id : null
  } catch {
    return null
  }
}

function persistEverywhere(session: PrepSession | null) {
  if (session) localStorage.setItem(KEY, JSON.stringify(session))
  else localStorage.removeItem(KEY)
  writeCookie(session)
  writeUrl(session)
  publishManifest(session?.id ?? null)
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

function rememberReplaceSession(code: string) {
  try {
    sessionStorage.setItem(REPLACE_KEY, code)
  } catch {
    /* private mode */
  }
}

function takeReplaceSession() {
  try {
    const code = sessionStorage.getItem(REPLACE_KEY)?.trim().toUpperCase()
    sessionStorage.removeItem(REPLACE_KEY)
    return code || undefined
  } catch {
    return undefined
  }
}

async function unsubscribeBrowserPush() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return
  try {
    const registration = await navigator.serviceWorker.ready
    const existing = await registration.pushManager.getSubscription()
    await existing?.unsubscribe()
  } catch {
    /* still clear the server row */
  }
}

async function dropReminderChannels(publicCode: string) {
  await unsubscribeBrowserPush()
  await Promise.allSettled([
    unsubscribeApiTelegram(publicCode),
    unsubscribeApiPush(publicCode),
  ])
}

export async function releaseSessionReminders(publicCode: string) {
  rememberReplaceSession(publicCode)
  await dropReminderChannels(publicCode)
}

export function clearSession() {
  const cached = loadSession()
  if (cached?.id) rememberReplaceSession(cached.id)
  persistEverywhere(null)
  clearFoodChat()
  clearFoodChatUi()
  clearTimelineUi()
  clearTimelineCache()
}

async function withTimeline(session: PrepSession) {
  if (!getCachedTimeline(timelineCacheKey(session))) {
    try {
      await loadTimeline(session)
    } catch {
      /* Home / Timeline show the error if this fetch fails */
    }
  }
  return session
}

/** Refresh from API using cached public_code; keep cache if offline; clear if 404. */
export async function hydrateSession(): Promise<PrepSession | null> {
  const fromLink = publicCodeFromUrl()
  if (fromLink) {
    try {
      const fresh = fromApiSession(await getApiSession(fromLink))
      saveSession(fresh)
      return withTimeline(fresh)
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        const fallback = loadSession()
        return fallback ? withTimeline(fallback) : null
      }
    }
  }

  const cached = loadSession()
  if (!cached?.id) return null

  try {
    const fresh = fromApiSession(await getApiSession(cached.id))
    saveSession(fresh)
    return withTimeline(fresh)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      clearSession()
      return null
    }
    return withTimeline(cached)
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
    preferred_lang: storedPreferredLang(),
    replaces_public_code: takeReplaceSession(),
  })
  const session = fromApiSession(row)
  saveSession(session)
  await loadTimeline(session)
  return session
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
  await loadTimeline(next)
  return next
}

/** Telegram bot username without @. Set VITE_TELEGRAM_BOT_USERNAME after BotFather. */
export const TELEGRAM_BOT =
  import.meta.env.VITE_TELEGRAM_BOT_USERNAME?.replace(/^@/, '').trim() ||
  'PrepPathBot'

export function telegramStartHref(sessionId: string) {
  return `https://t.me/${TELEGRAM_BOT}?start=${encodeURIComponent(sessionId)}`
}
