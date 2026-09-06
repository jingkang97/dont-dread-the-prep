import { useEffect, useState } from 'react'
import { getApiTimeline, type ApiEventKind } from './api'
import type { PrepSession } from './session'
import type { EventKind, TimelineEvent } from './timeline'

function isEventKind(value: string): value is EventKind {
  return (
    value === 'diet' ||
    value === 'med' ||
    value === 'dose' ||
    value === 'meal' ||
    value === 'fast' ||
    value === 'arrive' ||
    value === 'check' ||
    value === 'gap'
  )
}

function fromApiKind(kind: ApiEventKind): EventKind {
  return isEventKind(kind) ? kind : 'gap'
}

export function useSessionTimeline(session: PrepSession) {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getApiTimeline(session.id)
        if (cancelled) return
        setEvents(
          data.events.map((e) => ({
            id: e.id,
            at: new Date(e.at),
            kind: fromApiKind(e.kind),
            title: e.title,
            detail: e.detail,
            source: data.source_label,
            tentative: e.tentative,
          })),
        )
      } catch (err) {
        if (cancelled) return
        setEvents([])
        setError(err instanceof Error ? err.message : 'Failed to load timeline')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [
    session.id,
    session.date,
    session.slot,
    session.reportingTime,
    session.protocolName,
    session.hospitalId,
  ])

  return {
    events,
    loading,
    error,
  }
}
