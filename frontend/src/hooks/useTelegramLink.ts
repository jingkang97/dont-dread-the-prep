import { useEffect, useRef, useState } from 'react'
import { getApiSession, unsubscribeApiTelegram } from '../lib/api'
import { fromApiSession, saveSession, type PrepSession } from '../lib/session'

const POLL_MS = 2000
const TIMEOUT_MS = 90_000

export function useTelegramLink(session: PrepSession, onSession: (s: PrepSession) => void) {
  const [waiting, setWaiting] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const [busy, setBusy] = useState(false)
  const waitGen = useRef(0)

  useEffect(() => {
    if (session.telegramLinked) return
    let cancelled = false

    async function pull() {
      try {
        const next = fromApiSession(await getApiSession(session.id))
        if (cancelled) return
        saveSession(next)
        onSession(next)
      } catch {
        /* still unlinked */
      }
    }

    function onVis() {
      if (document.visibilityState === 'visible') void pull()
    }

    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('focus', pull)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('focus', pull)
    }
  }, [session.id, session.telegramLinked, onSession])

  async function startLink() {
    const gen = ++waitGen.current
    setTimedOut(false)
    setWaiting(true)
    try {
      const deadline = Date.now() + TIMEOUT_MS
      while (Date.now() < deadline && waitGen.current === gen) {
        await new Promise((resolve) => setTimeout(resolve, POLL_MS))
        if (waitGen.current !== gen) return
        try {
          const next = fromApiSession(await getApiSession(session.id))
          saveSession(next)
          onSession(next)
          if (next.telegramLinked) return
        } catch {
          /* keep polling */
        }
      }
      if (waitGen.current === gen) setTimedOut(true)
    } finally {
      if (waitGen.current === gen) setWaiting(false)
    }
  }

  async function disable() {
    setBusy(true)
    try {
      await unsubscribeApiTelegram(session.id)
      const next = { ...session, telegramLinked: false }
      saveSession(next)
      onSession(next)
    } finally {
      setBusy(false)
    }
  }

  return { waiting, timedOut, startLink, disable, busy, linked: session.telegramLinked }
}
