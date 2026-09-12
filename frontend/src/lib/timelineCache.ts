import type { PrepSession } from './session'
import type { TimelineEvent } from './timeline'

type CachedTimeline = {
  events: TimelineEvent[]
}

const cache = new Map<string, CachedTimeline>()

export function timelineCacheKey(session: PrepSession) {
  return [
    session.id,
    session.date,
    session.slot,
    session.reportingTime,
    session.protocolName ?? '',
    session.hospitalId,
  ].join('|')
}

export function getCachedTimeline(key: string) {
  return cache.get(key) ?? null
}

export function setCachedTimeline(key: string, events: TimelineEvent[]) {
  cache.set(key, { events })
}

export function clearTimelineCache(sessionId?: string) {
  if (!sessionId) {
    cache.clear()
    return
  }
  for (const key of [...cache.keys()]) {
    if (key === sessionId || key.startsWith(`${sessionId}|`)) cache.delete(key)
  }
}
