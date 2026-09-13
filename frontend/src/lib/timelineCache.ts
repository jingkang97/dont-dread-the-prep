import { getApiTimeline, type ApiTimeline } from './api/timeline'
import type { PrepSession } from './session'
import type { TimelineEvent } from './timeline'

type CachedTimeline = {
  events: TimelineEvent[]
}

const STORAGE_KEY = 'preppath.timeline.v1'
const memory = new Map<string, CachedTimeline>()
const inflight = new Map<string, Promise<TimelineEvent[]>>()

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

function mapEvents(data: ApiTimeline): TimelineEvent[] {
  return data.events.map((e) => ({
    id: e.id,
    at: new Date(e.at),
    kind: e.kind,
    title: e.title,
    detail: e.detail,
    source: data.source_label,
    tentative: e.tentative,
    agent: e.agent,
  }))
}

function toStored(events: TimelineEvent[]) {
  return events.map((event) => ({ ...event, at: event.at.toISOString() }))
}

function fromStored(raw: unknown): TimelineEvent[] | null {
  if (!Array.isArray(raw)) return null
  const events: TimelineEvent[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') return null
    const row = item as { at?: unknown; id?: unknown }
    if (typeof row.id !== 'string' || typeof row.at !== 'string') return null
    const at = new Date(row.at)
    if (Number.isNaN(at.getTime())) return null
    events.push({ ...(item as TimelineEvent), at })
  }
  return events
}

function readStore(): Record<string, unknown> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {}
  } catch {
    return {}
  }
}

function writeStore(next: Record<string, unknown>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export function getCachedTimeline(key: string) {
  const hit = memory.get(key)
  if (hit) return hit
  const events = fromStored(readStore()[key])
  if (!events) return null
  const cached = { events }
  memory.set(key, cached)
  return cached
}

export function setCachedTimeline(key: string, events: TimelineEvent[]) {
  memory.set(key, { events })
  const store = readStore()
  store[key] = toStored(events)
  writeStore(store)
}

export function clearTimelineCache(sessionId?: string) {
  if (!sessionId) {
    memory.clear()
    localStorage.removeItem(STORAGE_KEY)
    return
  }
  for (const key of [...memory.keys()]) {
    if (key === sessionId || key.startsWith(`${sessionId}|`)) memory.delete(key)
  }
  const store = readStore()
  for (const key of Object.keys(store)) {
    if (key === sessionId || key.startsWith(`${sessionId}|`)) delete store[key]
  }
  writeStore(store)
}

export async function loadTimeline(session: PrepSession): Promise<TimelineEvent[]> {
  const key = timelineCacheKey(session)
  const hit = getCachedTimeline(key)
  if (hit) return hit.events
  const pending = inflight.get(key)
  if (pending) return pending
  const request = getApiTimeline(session.id)
    .then((data) => {
      const events = mapEvents(data)
      setCachedTimeline(key, events)
      return events
    })
    .finally(() => {
      inflight.delete(key)
    })
  inflight.set(key, request)
  return request
}
