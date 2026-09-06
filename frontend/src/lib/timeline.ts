import { differenceInCalendarDays, startOfDay } from 'date-fns'
import type { HospitalId, Slot } from '../data/hospitals'
import type { StringKey } from '../i18n/strings'

export type EventKind = 'diet' | 'med' | 'dose' | 'meal' | 'fast' | 'arrive' | 'check' | 'gap'

export type TimelineEvent = {
  id: string
  at: Date
  titleKey?: StringKey
  titleVars?: Record<string, string>
  detailKey?: StringKey
  detailVars?: Record<string, string>
  fluidKey?: StringKey
  /** Hospital source line — stays in English. */
  citedDetail?: string
  /** Resolved copy from the API (preferred over titleKey / detailKey). */
  title?: string
  detail?: string
  kind: EventKind
  source: string
  tentative?: boolean
}

export type SessionInput = {
  hospitalId: HospitalId
  date: string
  slot: Slot
  reportingTime: string
}

type Translate = (key: StringKey, vars?: Record<string, string>) => string

export function resolveEventText(event: TimelineEvent, t: Translate) {
  if (event.title != null) {
    return { title: event.title, detail: event.detail ?? event.citedDetail ?? '' }
  }
  const detailVars = {
    ...event.detailVars,
    ...(event.fluidKey ? { fluid: t(event.fluidKey) } : {}),
  }
  return {
    title: event.titleKey ? t(event.titleKey, event.titleVars) : '',
    detail: event.citedDetail ?? (event.detailKey ? t(event.detailKey, detailVars) : ''),
  }
}

export function fromNowDays(at: Date, now: Date, t: Translate) {
  const n = differenceInCalendarDays(startOfDay(at), startOfDay(now))
  if (n < 0) return ''
  if (n === 0) return t('tl.fromNowToday')
  if (n === 1) return t('tl.fromNowTomorrow')
  return t('tl.fromNowDays', { n: String(n) })
}

function subHours(date: Date, hours: number) {
  return new Date(date.getTime() - hours * 60 * 60 * 1000)
}

export function defaultReporting(slot: Slot) {
  return slot === 'am' ? '08:00' : '13:30'
}

export function remindersFor(report: Date) {
  return [
    { key: 't72' as const, label: 'T−72 hours', at: subHours(report, 72), blurb: 'Low-residue diet should already be underway. Open your timeline.' },
    { key: 't24' as const, label: 'T−24 hours', at: subHours(report, 24), blurb: 'Eve of scope. Last meal and first Picoprep doses are close.' },
    { key: 't6' as const, label: 'T−6 hours', at: subHours(report, 6), blurb: 'Final doses and fasting cutoff. Check stool colour before you leave.' },
  ]
}
