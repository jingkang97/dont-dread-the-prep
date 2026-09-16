import { useLang } from '../i18n/LanguageContext'
import type { PrepSession } from '../lib/session'
import { fromNowDays, isEventUpcoming } from '../lib/timeline'
import { useSessionTimeline } from '../lib/useSessionTimeline'
import { useSessionHospital } from './useSessionHospital'

export function usePrepSummary(session: PrepSession) {
  const { t } = useLang()
  const { hospital: row, short } = useSessionHospital(session)
  const { events, loading, error } = useSessionTimeline(session)
  const now = new Date()
  const nextUpcoming = events.find((e) => isEventUpcoming(e, now))
  const next = nextUpcoming ?? events[events.length - 1]
  const nextWhen = next ? fromNowDays(next.at, now, t) : ''
  const report = events.find((e) => e.id === 'arrive')?.at
  const started = events[0] ? !isEventUpcoming(events[0], now) : false

  const hospital = {
    short,
    name: row?.name ?? short,
  }

  return { hospital, events, loading, error, now, next, nextUpcoming, nextWhen, report, started }
}
