import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { format, isAfter, isBefore, isSameDay, isToday, startOfDay, startOfMonth } from 'date-fns'
import { HOSPITALS } from '../data/hospitals'
import { MonthCalendar } from '../components/MonthCalendar'
import { Card, SectionLabel } from '../components/ui'
import { useLang } from '../i18n/LanguageContext'
import type { StringKey } from '../i18n/strings'
import type { PrepSession } from '../lib/session'
import { buildTimeline, fromNowDays, resolveEventText, type EventKind, type TimelineEvent } from '../lib/timeline'
import { cn } from '../lib/cn'
import { DATE_LOCALES } from '../lib/dateLocale'

const KIND_TONE: Record<EventKind, string> = {
  diet: 'bg-teal/15 text-teal-deep',
  med: 'bg-ask-bg text-ask',
  dose: 'bg-[#e8f8ff] text-[#007aff]',
  meal: 'bg-yes-bg text-yes',
  fast: 'bg-no-bg text-no',
  arrive: 'bg-cream text-teal-deep',
  check: 'bg-ask-bg text-ask',
  gap: 'bg-ask-bg text-ask',
}

const KIND_KEY: Record<EventKind, StringKey> = {
  diet: 'kind.diet',
  med: 'kind.med',
  dose: 'kind.dose',
  meal: 'kind.meal',
  fast: 'kind.fast',
  arrive: 'kind.arrive',
  check: 'kind.check',
  gap: 'kind.gap',
}

function groupByDay(events: TimelineEvent[]) {
  const groups: { day: Date; events: TimelineEvent[] }[] = []
  for (const event of events) {
    const last = groups[groups.length - 1]
    if (last && isSameDay(last.day, event.at)) last.events.push(event)
    else groups.push({ day: startOfDay(event.at), events: [event] })
  }
  return groups
}

export function Timeline({ session }: { session: PrepSession }) {
  const { t } = useLang()
  const hospital = HOSPITALS[session.hospitalId]
  const events = buildTimeline(session)
  const now = new Date()
  const nextId = events.find((e) => isAfter(e.at, now))?.id
  const next = events.find((e) => isAfter(e.at, now)) ?? events[events.length - 1]
  const days = useMemo(() => groupByDay(events), [events])

  const [view, setView] = useState<'list' | 'calendar'>('list')
  const procedureDay = useMemo(() => {
    const [y, m, d] = session.date.split('-').map(Number)
    return new Date(y, m - 1, d)
  }, [session.date])
  const [picked, setPicked] = useState(() => {
    const today = startOfDay(new Date())
    const [y, m, d] = session.date.split('-').map(Number)
    const scope = new Date(y, m - 1, d)
    return isAfter(today, scope) ? scope : today
  })

  const eventDays = useMemo(
    () =>
      events.map((e) => startOfDay(e.at)).filter((day, i, all) => all.findIndex((d) => isSameDay(d, day)) === i),
    [events],
  )
  const startMonth = events[0] ? startOfMonth(events[0].at) : undefined
  const endMonth = events.length ? startOfMonth(events[events.length - 1].at) : undefined
  const dayEvents = events.filter((e) => isSameDay(e.at, picked))

  return (
    <div className="px-5 pb-10 pt-6">
      <SectionLabel>{t('tl.for', { hospital: hospital.short })}</SectionLabel>
      <h1 className="font-display mt-1 text-[28px] leading-tight text-navy">{t('tl.title')}</h1>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{t('tl.lead')}</p>

      <div className="mt-5 flex rounded-[10px] bg-black/5 p-[3px]">
        {(['list', 'calendar'] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            className={cn(
              'min-w-0 flex-1 rounded-[8px] px-1 py-1.5 text-[13px] font-semibold transition',
              view === id ? 'bg-white text-ink shadow-sm' : 'text-muted',
            )}
          >
            {t(id === 'list' ? 'tl.list' : 'tl.calendar')}
          </button>
        ))}
      </div>

      {view === 'list' ? (
        <div className="mt-2">
          {days.map((group) => (
            <section key={group.day.toISOString()} className="mt-1">
              <DayHeader day={group.day} procedureDay={procedureDay} />
              <ol
                className={cn(
                  'relative ml-2 border-l pl-5 pt-2',
                  isToday(group.day)
                    ? 'border-teal/40'
                    : isSameDay(group.day, procedureDay)
                      ? 'border-navy/25'
                      : 'border-line',
                )}
              >
                {group.events.map((event) => (
                  <li key={event.id} className="relative pb-4 last:pb-1">
                    {event.id === nextId && (
                      <motion.span
                        className="pointer-events-none absolute -left-[31px] top-[2px] h-[22px] w-[22px] rounded-full bg-teal"
                        animate={{ scale: [0.85, 1.2, 1.5], opacity: [0, 0.3, 0] }}
                        transition={{
                          duration: 2.2,
                          times: [0, 0.4, 1],
                          repeat: Infinity,
                          repeatDelay: 0.6,
                          ease: 'easeOut',
                        }}
                      />
                    )}
                    <span
                      className={cn(
                        'absolute -left-[27px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-paper-2',
                        isBefore(event.at, now) ? 'bg-muted' : event.tentative ? 'bg-ask' : 'bg-teal',
                      )}
                    />
                    <EventStamp event={event} nextId={nextId} now={now} />
                    <EventCard event={event} isNext={event.id === nextId} isPast={isBefore(event.at, now)} />
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-5">
          <Card className="px-2 py-3">
            <MonthCalendar
              selected={picked}
              onSelect={setPicked}
              eventDays={eventDays}
              procedureDay={procedureDay}
              disabledAfter={procedureDay}
              startMonth={startMonth}
              endMonth={endMonth}
            />
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-2 pb-1 text-[11px] font-semibold text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full text-[11px] font-bold text-teal-deep shadow-[0_0_0_2px_#00c7be]">
                  12
                </span>
                {t('tl.today')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-teal text-[11px] font-bold text-white">
                  12
                </span>
                {t('tl.selected')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-navy text-[11px] font-bold text-white">
                  12
                </span>
                {t('tl.scopeDay')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="flex flex-col items-center gap-[3px]">
                  <span className="text-[11px] font-bold leading-none text-ink">12</span>
                  <span className="h-[5px] w-[5px] rounded-full bg-teal" />
                </span>
                {t('tl.hasSteps')}
              </span>
            </div>
          </Card>
          {dayEvents.length === 0 ? (
            <p className="mt-4 text-[14px] text-ink-soft">{t('tl.noEvents')}</p>
          ) : (
            <div className="mt-2">
              <DayHeader day={picked} sticky={false} procedureDay={procedureDay} />
              <div className="grid gap-3">
                {dayEvents.map((event) => (
                  <div key={event.id}>
                    <EventStamp event={event} nextId={nextId} now={now} />
                    <EventCard event={event} isNext={event.id === nextId} isPast={isBefore(event.at, now)} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DayHeader({
  day,
  sticky = true,
  procedureDay,
}: {
  day: Date
  sticky?: boolean
  procedureDay?: Date
}) {
  const { t, lang } = useLang()
  const today = isToday(day)
  const scope = procedureDay ? isSameDay(day, procedureDay) : false
  const until = scope && !today ? fromNowDays(day, new Date(), t) : ''
  return (
    <h2
      className={cn(
        'flex items-center gap-2 bg-paper py-2 font-display text-[20px] tracking-tight',
        today ? 'text-teal-deep' : scope ? 'text-navy' : 'text-ink',
        sticky && 'sticky top-0 z-10 -mx-5 px-5',
      )}
    >
      <span className="min-w-0 truncate">{format(day, 'EEE d MMM', { locale: DATE_LOCALES[lang] })}</span>
      {today && (
        <span className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold tracking-wide text-teal-deep shadow-[inset_0_0_0_1.5px_#00c7be]">
          {t('tl.today')}
        </span>
      )}
      {scope && (
        <span className="shrink-0 rounded-full bg-navy px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
          {t('tl.scopeDay')}
        </span>
      )}
      {until ? <span className="ml-auto shrink-0 text-[12px] font-semibold text-muted">{until}</span> : null}
    </h2>
  )
}

function EventStamp({ event, nextId, now }: { event: TimelineEvent; nextId?: string; now: Date }) {
  const { t } = useLang()
  const when = event.id === nextId ? fromNowDays(event.at, now, t) : ''
  return (
    <p className="text-[13px] font-semibold text-navy">
      {format(event.at, 'h:mm a')}
      {event.id === nextId ? ` · ${t('tl.next')}` : ''}
      {when ? ` · ${when}` : ''}
    </p>
  )
}

function EventCard({
  event,
  isNext,
  isPast,
}: {
  event: TimelineEvent
  isNext?: boolean
  isPast?: boolean
}) {
  const { t } = useLang()
  const { title, detail } = resolveEventText(event, t)
  return (
    <Card
      className={cn(
        'mt-1.5 p-3.5 transition',
        event.tentative && 'border-ask/30',
        isNext && 'ring-1 ring-teal/45 shadow-[0_2px_10px_rgba(0,199,190,0.14)]',
        isPast && !isNext && 'opacity-65',
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide', KIND_TONE[event.kind])}>
          {t(KIND_KEY[event.kind])}
        </span>
        {event.tentative && (
          <span className="text-[10px] font-bold tracking-wide text-ask">{t('tl.notOnForm')}</span>
        )}
      </div>
      <p className="mt-1.5 text-[16px] font-semibold text-ink">{title}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{detail}</p>
      <p className="mt-2 text-[11px] leading-relaxed text-muted">
        {t('source.cited')}: {event.source}
      </p>
    </Card>
  )
}
