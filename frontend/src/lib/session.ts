import type { HospitalId, Slot } from '../data/hospitals'
import { defaultReporting } from './timeline'
import { clearFoodChat } from './foodChat'

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
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as PrepSession
  } catch {
    return null
  }
}

export function saveSession(session: PrepSession) {
  localStorage.setItem(KEY, JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem(KEY)
  clearFoodChat()
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
  return next
}

export const TWILIO_SANDBOX = '14155238886'

export function waJoinHref(sessionId: string, sandboxJoin = 'join-code') {
  const text = `join ${sandboxJoin}\n\nReminders for session ${sessionId}`
  return `https://wa.me/${TWILIO_SANDBOX}?text=${encodeURIComponent(text)}`
}
