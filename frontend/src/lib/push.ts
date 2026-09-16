import { getVapidPublicKey, subscribeApiPush, unsubscribeApiPush } from './api'
import type { PrepSession } from './session'
import { saveSession } from './session'

function urlBase64ToUint8Array(value: string) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4)
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i)
  return out
}

export function pushSupported() {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window
}

export function isStandaloneDisplay() {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  const nav = navigator as Navigator & { standalone?: boolean }
  return nav.standalone === true
}

export function isIosDevice() {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

export function isAndroidDevice() {
  if (typeof navigator === 'undefined') return false
  return /android/i.test(navigator.userAgent)
}

export function preferredShortcutOs(): 'ios' | 'android' {
  return isAndroidDevice() && !isIosDevice() ? 'android' : 'ios'
}

export async function registerPushWorker() {
  if (!pushSupported()) return null
  return navigator.serviceWorker.register('/sw.js')
}

export async function enablePush(session: PrepSession): Promise<PrepSession> {
  if (!isStandaloneDisplay()) throw new Error('not-installed')
  const registration = await registerPushWorker()
  if (!registration) throw new Error('unsupported')
  const { public_key } = await getVapidPublicKey()
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') throw new Error('denied')
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(public_key),
  })
  const json = subscription.toJSON()
  const endpoint = json.endpoint
  const p256dh = json.keys?.p256dh
  const auth = json.keys?.auth
  if (!endpoint || !p256dh || !auth) throw new Error('incomplete')
  await subscribeApiPush(session.id, { endpoint, keys: { p256dh, auth } })
  const next = { ...session, pushOptIn: true }
  saveSession(next)
  await registration.showNotification("You're set for reminders", {
    body: 'Reminders follow your timeline — meds, diet, prep doses, stool check, and fasting.',
    icon: '/icon-192.png',
    data: { url: `/?s=${encodeURIComponent(session.id)}&go=timeline` },
  })
  return next
}

export async function disablePush(session: PrepSession): Promise<PrepSession> {
  try {
    const registration = await navigator.serviceWorker.ready
    const existing = await registration.pushManager.getSubscription()
    await existing?.unsubscribe()
  } catch {
    /* still clear the server row */
  }
  try {
    await unsubscribeApiPush(session.id)
  } catch {
    /* keep local off-state */
  }
  const next = { ...session, pushOptIn: false }
  saveSession(next)
  return next
}
