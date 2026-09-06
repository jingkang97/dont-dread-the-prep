import { useMemo } from 'react'
import { isAfter, isBefore } from 'date-fns'
import { HOSPITALS } from '../data/hospitals'
import { useLang } from '../i18n/LanguageContext'
import type { PrepSession } from '../lib/session'
import { buildTimeline, fromNowDays } from '../lib/timeline'

export function usePrepSummary(session: PrepSession) {
  const { t } = useLang()
  const hospital = HOSPITALS[session.hospitalId]
  const events = useMemo(() => buildTimeline(session), [session])
  const now = new Date()
  const nextUpcoming = events.find((e) => isAfter(e.at, now))
  const next = nextUpcoming ?? events[events.length - 1]
  const nextWhen = next ? fromNowDays(next.at, now, t) : ''
  const report = events.find((e) => e.id === 'arrive')?.at
  const started = events[0] ? isBefore(events[0].at, now) : false

  return { hospital, events, now, next, nextUpcoming, nextWhen, report, started }
}
