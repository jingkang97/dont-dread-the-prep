export type TimelineView = 'list' | 'calendar'

type Stored = {
  sessionId: string
  date: string
  listTop: number
  view: TimelineView
  landed: boolean
}

/** In-memory only: first Timeline visit lands on the next step; tab switches restore scroll. */
let stored: Stored | null = null

export function loadTimelineUi(sessionId: string, date: string): Stored | null {
  if (stored?.sessionId !== sessionId || stored?.date !== date) return null
  return stored
}

export function saveTimelineUi(
  sessionId: string,
  date: string,
  patch: Partial<Omit<Stored, 'sessionId' | 'date'>>,
) {
  stored = {
    sessionId,
    date,
    listTop: patch.listTop ?? stored?.listTop ?? 0,
    view: patch.view ?? stored?.view ?? 'list',
    landed: patch.landed ?? stored?.landed ?? false,
  }
}

export function clearTimelineUi() {
  stored = null
}
