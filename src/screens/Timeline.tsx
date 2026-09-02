import { useMemo, useState } from 'react'
import { format, isAfter, isBefore, isSameDay, startOfDay, startOfMonth } from 'date-fns'
import { HOSPITALS } from '../data/hospitals'
import { MonthCalendar } from '../components/MonthCalendar'
import { Card, SectionLabel } from '../components/ui'
import { useLang } from '../i18n/LanguageContext'
import type { StringKey } from '../i18n/strings'
import type { PrepSession } from '../lib/session'
import { buildTimeline, type EventKind, type TimelineEvent } from '../lib/timeline'
import { cn } from '../lib/cn'

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

export function Timeline({ session }: { session: PrepSession }) {
  const { t } = useLang()
  const hospital = HOSPITALS[session.hospitalId]
  const events = buildTimeline(session)
  const now = new Date()
  const nextId = events.find((e) => isAfter(e.at, now))?.id
  const next = events.find((e) => isAfter(e.at, now)) ?? events[events.length - 1]

  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [picked, setPicked] = useState(() => startOfDay(next?.at ?? now))

  const eventDays = useMemo(
    () =>
      events.map((e) => startOfDay(e.at)).filter((day, i, all) => all.findIndex((d) => isSameDay(d, day)) === i),
    [events],
  )
  const procedureDay = useMemo(() => {
    const [y, m, d] = session.date.split('-').map(Number)
    return new Date(y, m - 1, d)
  }, [session.date])
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
        <ol className="relative mt-6 ml-2 border-l border-line pl-5">
          {events.map((event) => (
            <li key={event.id} className="relative pb-6 last:pb-0">
              <span
                className={cn(
                  'absolute -left-[27px] top-1 h-3.5 w-3.5 rounded-full border-2 border-paper-2',
                  isBefore(event.at, now) ? 'bg-muted' : event.tentative ? 'bg-ask' : 'bg-teal',
                )}
              />
              <EventStamp event={event} nextId={nextId} />
              <EventCard event={event} />
            </li>
          ))}
        </ol>
      ) : (
        <div className="mt-5">
          <Card className="px-2 py-3">
            <MonthCalendar
              selected={picked}
              onSelect={setPicked}
              eventDays={eventDays}
              procedureDay={procedureDay}
              startMonth={startMonth}
              endMonth={endMonth}
            />
            <div className="mt-2 flex items-center justify-center gap-4 pb-1 text-[11px] font-semibold text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-[14px] w-[14px] rounded-full bg-teal" />
                {t('tl.today')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-[14px] w-[14px] rounded-full bg-navy" />
                {t('tl.scopeDay')}
              </span>
            </div>
          </Card>
          {dayEvents.length === 0 ? (
            <p className="mt-4 text-[14px] text-ink-soft">{t('tl.noEvents')}</p>
          ) : (
            <div className="mt-4 grid gap-3">
              {dayEvents.map((event) => (
                <div key={event.id}>
                  <EventStamp event={event} nextId={nextId} />
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function EventStamp({ event, nextId }: { event: TimelineEvent; nextId?: string }) {
  const { t } = useLang()
  return (
    <p className="text-[12px] font-semibold text-muted">
      {format(event.at, 'EEE d MMM · h:mm a')}
      {event.id === nextId ? ` · ${t('tl.next')}` : ''}
    </p>
  )
}

function EventCard({ event }: { event: TimelineEvent }) {
  const { t } = useLang()
  return (
    <Card className={cn('mt-1.5 p-3.5', event.tentative && 'border-ask/30')}>
      <div className="flex items-center gap-2">
        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide', KIND_TONE[event.kind])}>
          {t(KIND_KEY[event.kind])}
        </span>
        {event.tentative && (
          <span className="text-[10px] font-bold tracking-wide text-ask">{t('tl.notOnForm')}</span>
        )}
      </div>
      <p className="mt-1.5 text-[16px] font-semibold text-ink">{event.title}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{event.detail}</p>
      <p className="mt-2 text-[11px] leading-relaxed text-muted">
        {t('source.cited')}: {event.source}
      </p>
    </Card>
  )
}
