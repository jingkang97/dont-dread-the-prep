import { useEffect, useState } from 'react'
import {
  getCachedTimeline,
  loadTimeline,
  timelineCacheKey,
} from './timelineCache'
import type { PrepSession } from './session'
import type { TimelineEvent } from './timeline'

export function useSessionTimeline(session: PrepSession) {
  const key = timelineCacheKey(session)
  const cached = getCachedTimeline(key)
  const [events, setEvents] = useState<TimelineEvent[]>(() => cached?.events ?? [])
  const [loading, setLoading] = useState(!cached)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const hit = getCachedTimeline(key)
    if (hit) {
      setEvents(hit.events)
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    void loadTimeline(session)
      .then((next) => {
        if (cancelled) return
        setEvents(next)
      })
      .catch((err) => {
        if (cancelled) return
        setEvents([])
        setError(err instanceof Error ? err.message : 'Failed to load timeline')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [key, session.id])

  return {
    events,
    loading,
    error,
  }
}
