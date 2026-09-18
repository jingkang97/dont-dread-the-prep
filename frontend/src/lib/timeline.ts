import { differenceInCalendarDays, endOfDay, isBefore, startOfDay } from 'date-fns'
import type { HospitalId, Slot } from '../data/hospitals'
import type { StringKey } from '../i18n/strings'

export type EventKind = 'diet' | 'prep' | 'med' | 'meal' | 'fast' | 'arrive' | 'stool'

export type TimelineEvent = {
  id: string
  at: Date
  titleKey?: StringKey
  titleVars?: Record<string, string>
  detailKey?: StringKey
  detailVars?: Record<string, string>
  fluidKey?: StringKey
  /** Hospital source line (English from the API; shown through tx()). */
  citedDetail?: string
  /** Resolved copy from the API (preferred over titleKey / detailKey). */
  title?: string
  detail?: string
  kind: EventKind
  source: string
  tentative?: boolean
  /** Prep agent on bowel-prep steps: 'picoprep' | 'peg' | null. */
  agent?: string | null
  /** PNG filename under public/timeline (protocol_steps.prep_image_label). */
  prepImageLabel?: string | null
  /** Day-scoped (e.g. med stops). `at` is still midnight for sorting. */
  allDay?: boolean
}

/** Past for timed events = clock passed; for all-day = calendar day ended. */
export function isEventPast(event: TimelineEvent, now: Date) {
  if (event.allDay) return isBefore(endOfDay(event.at), now)
  return isBefore(event.at, now)
}

export function isEventUpcoming(event: TimelineEvent, now: Date) {
  return !isEventPast(event, now)
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

export function defaultReporting(slot: Slot) {
  return slot === 'am' ? '08:00' : '13:30'
}
