import { useEffect, useState } from 'react'
import type { OnboardingResult } from '../data/onboarding'
import type { Slot } from '../data/hospitals'
import {
  clearSession,
  createSession,
  hydrateSession,
  releaseSessionReminders,
  screenFromGo,
  screenFromUrl,
  updateAppointment,
  type PrepSession,
  type Screen,
} from '../lib/session'
import { isDemoPlaying } from '../demo/enabled'
import { dropHomeTourPending, queueHomeTour } from '../lib/homeTour'

export function useSession() {
  const [session, setSession] = useState<PrepSession | null>(null)
  const [screen, setScreen] = useState<Screen>('onboarding')
  const [ready, setReady] = useState(false)
  const [onboardKey, setOnboardKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const existing = await hydrateSession()
      if (cancelled) return
      if (existing) {
        setSession(existing)
        setScreen(screenFromUrl() ?? 'home')
      }
      setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const applyUrl = () => {
      const go = screenFromUrl()
      if (go) setScreen(go)
    }
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'preppath-open') return
      const go = screenFromGo(event.data.go)
      if (go) setScreen(go)
    }
    window.addEventListener('popstate', applyUrl)
    window.addEventListener('pageshow', applyUrl)
    navigator.serviceWorker?.addEventListener('message', onMessage)
    return () => {
      window.removeEventListener('popstate', applyUrl)
      window.removeEventListener('pageshow', applyUrl)
      navigator.serviceWorker?.removeEventListener('message', onMessage)
    }
  }, [])

  async function create(draft: OnboardingResult) {
    const next = await createSession(draft)
    if (!isDemoPlaying()) queueHomeTour()
    setSession(next)
    setScreen('home')
    return next
  }

  async function clear() {
    const current = session
    if (current?.id) await releaseSessionReminders(current.id)
    dropHomeTourPending()
    clearSession()
    setSession(null)
    setScreen('onboarding')
    setOnboardKey((k) => k + 1)
  }

  async function update(patch: { date: string; slot: Slot; reportingTime: string }) {
    if (!session) throw new Error('No session to update')
    const next = await updateAppointment(session, patch)
    setSession(next)
    setScreen('home')
    return next
  }

  return { session, setSession, screen, setScreen, ready, create, clear, update, onboardKey }
}
