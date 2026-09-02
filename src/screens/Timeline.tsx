import { useMemo, useState } from 'react'
import { format, isAfter, isBefore, isSameDay, isToday, startOfDay, startOfMonth } from 'date-fns'
import { enGB, ms, ta, zhCN } from 'date-fns/locale'
import { HOSPITALS } from '../data/hospitals'
import { MonthCalendar } from '../components/MonthCalendar'
import { Card, SectionLabel } from '../components/ui'
import { useLang } from '../i18n/LanguageContext'
import type { StringKey } from '../i18n/strings'
import type { PrepSession } from '../lib/session'
import { buildTimeline, resolveEventText, type EventKind, type TimelineEvent } from '../lib/timeline'
import { cn } from '../lib/cn'

const DATE_LOCALES = { en: enGB, zh: zhCN, ms, ta } as const

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
        <div className="mt-2">
          {days.map((group) => (
            <section key={group.day.toISOString()} className="mt-1">
              <DayHeader day={group.day} />
              <ol className="relative ml-2 border-l border-line pl-5">
                {group.events.map((event) => (
                  <li key={event.id} className="relative pb-4 last:pb-1">
                    <span
                      className={cn(
                        'absolute -left-[27px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-paper-2',
                        isBefore(event.at, now) ? 'bg-muted' : event.tentative ? 'bg-ask' : 'bg-teal',
                      )}
                    />
                    <EventStamp event={event} nextId={nextId} />
                    <EventCard event={event} />
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
              startMonth={startMonth}
              endMonth={endMonth}
            />
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-2 pb-1 text-[11px] font-semibold text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full text-[11px] font-bold text-teal-deep shadow-[inset_0_0_0_1.5px_#00c7be]">
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
              <DayHeader day={picked} sticky={false} />
              <div className="grid gap-3">
                {dayEvents.map((event) => (
                  <div key={event.id}>
                    <EventStamp event={event} nextId={nextId} />
                    <EventCard event={event} />
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

function DayHeader({ day, sticky = true }: { day: Date; sticky?: boolean }) {
  const { t, lang } = useLang()
  return (
    <h2
      className={cn(
        'bg-paper py-2 font-display text-[20px] tracking-tight text-ink',
        sticky && 'sticky top-0 z-10 -mx-5 px-5',
      )}
    >
      {isToday(day) ? `${t('tl.today')} · ` : ''}
      {format(day, 'EEE d MMM', { locale: DATE_LOCALES[lang] })}
    </h2>
  )
}

function EventStamp({ event, nextId }: { event: TimelineEvent; nextId?: string }) {
  const { t } = useLang()
  return (
    <p className="text-[13px] font-semibold text-navy">
      {format(event.at, 'h:mm a')}
      {event.id === nextId ? ` · ${t('tl.next')}` : ''}
    </p>
  )
}

function EventCard({ event }: { event: TimelineEvent }) {
  const { t } = useLang()
  const { title, detail } = resolveEventText(event, t)
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
      <p className="mt-1.5 text-[16px] font-semibold text-ink">{title}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{detail}</p>
      <p className="mt-2 text-[11px] leading-relaxed text-muted">
        {t('source.cited')}: {event.source}
      </p>
    </Card>
  )
}
