import { useEffect, useState } from 'react'
import {
  getCachedTimeline,
  loadTimeline,
  timelineCacheKey,
} from './timelineCache'
import type { PrepSession } from './session'
import type { TimelineEvent } from './timeline'

function mapEvents(
  data: Awaited<ReturnType<typeof getApiTimeline>>,
): TimelineEvent[] {
  return data.events.map((e) => ({
    id: e.id,
    at: new Date(e.at),
    kind: e.kind,
    title: e.title,
    detail: e.detail,
    source: data.source_label,
    tentative: e.tentative,
    agent: e.agent,
    prepImageLabel: e.prep_image_label,
  }))
}

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
