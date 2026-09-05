import type { HospitalId, Slot } from '../data/hospitals'
import { defaultReporting } from './timeline'
import { clearFoodChat } from './foodChat'
import { clearTimelineUi } from './timelineUi'
import { clearFoodChatUi } from './foodChatUi'

export type Screen = 'onboarding' | 'home' | 'timeline' | 'food' | 'stool' | 'reminders'

export type PrepSession = {
  id: string
  hospitalId: HospitalId
  date: string
  slot: Slot
  reportingTime: string
  firstName?: string
  createdAt: string
  waOptIn: boolean
}

export function cleanFirstName(raw?: string) {
  const name = (raw ?? '').trim().replace(/\s+/g, ' ')
  if (!name) return undefined
  return name.slice(0, 24)
}

const KEY = 'preppath.session.v1'
const COOKIE = 'preppath_session'
const PARAM = 'p'
const HOSPITAL_IDS: HospitalId[] = ['sgh', 'nccs', 'ttsh', 'skh', 'cgh']

function parseSession(raw: unknown): PrepSession | null {
  if (!raw || typeof raw !== 'object') return null
  const s = raw as Partial<PrepSession>
  if (!s.id || !s.date || !s.reportingTime || !s.createdAt) return null
  if (s.slot !== 'am' && s.slot !== 'pm') return null
  if (!s.hospitalId || !HOSPITAL_IDS.includes(s.hospitalId)) return null
  return {
    id: String(s.id),
    hospitalId: s.hospitalId,
    date: String(s.date),
    slot: s.slot,
    reportingTime: String(s.reportingTime),
    firstName: cleanFirstName(s.firstName),
    createdAt: String(s.createdAt),
    waOptIn: Boolean(s.waOptIn),
  }
}

function encodeSession(session: PrepSession) {
  const json = JSON.stringify(session)
  return btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function decodeSession(token: string): PrepSession | null {
  try {
    const pad = token.length % 4 === 0 ? '' : '='.repeat(4 - (token.length % 4))
    const json = atob(token.replace(/-/g, '+').replace(/_/g, '/') + pad)
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
  const start = session
    ? `${window.location.pathname}?${PARAM}=${encodeSession(session)}`
    : window.location.pathname || '/'
  const manifest = {
    name: 'PrepPath',
    short_name: 'PrepPath',
    description: 'No-install colonoscopy prep companion.',
    display: 'standalone',
    orientation: 'portrait',
    theme_color: '#f2f2f7',
    background_color: '#f2f2f7',
    start_url: start,
    scope: '/',
    icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }],
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

export function newSessionId() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let id = ''
  for (let i = 0; i < 4; i += 1) {
    id += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return id
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
}

export function createSession(partial: {
  hospitalId: HospitalId
  date: string
  slot: Slot
  reportingTime?: string
  firstName?: string
}): PrepSession {
  const session: PrepSession = {
    id: newSessionId(),
    hospitalId: partial.hospitalId,
    date: partial.date,
    slot: partial.slot,
    reportingTime: partial.reportingTime || defaultReporting(partial.slot),
    firstName: cleanFirstName(partial.firstName),
    createdAt: new Date().toISOString(),
    waOptIn: false,
  }
  saveSession(session)
  return session
}

export function markWaOptIn(session: PrepSession): PrepSession {
  const next = { ...session, waOptIn: true }
  saveSession(next)
  return next
}

export function updateAppointment(
  session: PrepSession,
  patch: { date: string; slot: Slot; reportingTime: string },
): PrepSession {
  const next = { ...session, ...patch }
  saveSession(next)
  clearTimelineUi()
  return next
}

export const TWILIO_SANDBOX = '14155238886'

export function waJoinHref(sessionId: string, sandboxJoin = 'join-code') {
  const text = `join ${sandboxJoin}\n\nReminders for session ${sessionId}`
  return `https://wa.me/${TWILIO_SANDBOX}?text=${encodeURIComponent(text)}`
}
