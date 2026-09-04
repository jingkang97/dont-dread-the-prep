import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'motion/react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { format, isAfter, isBefore, isSameDay, isToday, startOfDay, startOfMonth } from 'date-fns'
import { HOSPITALS } from '../data/hospitals'
import { MonthCalendar } from '../components/MonthCalendar'
import { Card, SectionLabel } from '../components/ui'
import { useLang } from '../i18n/LanguageContext'
import type { StringKey } from '../i18n/strings'
import type { PrepSession } from '../lib/session'
import { buildTimeline, fromNowDays, resolveEventText, type EventKind, type TimelineEvent } from '../lib/timeline'
import { loadTimelineUi, saveTimelineUi, type TimelineView } from '../lib/timelineUi'
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

function scrollerOf(root: Element | null) {
  const inner = root?.querySelector('[data-tl-scroll]')
  if (inner instanceof HTMLElement) return inner
  const scroller = root?.closest('.overflow-y-auto')
  return scroller instanceof HTMLElement ? scroller : null
}

function scrollToChild(scroller: HTMLElement, el: HTMLElement, behavior: ScrollBehavior, offset = 0) {
  const top =
    el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - offset
  scroller.scrollTo({ top: Math.max(0, top), behavior })
}

function dayOffset(root: HTMLElement | null) {
  const day = root?.querySelector('[data-tl-day]')
  return day instanceof HTMLElement ? day.offsetHeight : 0
}

type JumpDir = 'up' | 'down' | 'here'

function nextStamp(li: HTMLElement | null) {
  const stamp = li?.querySelector('[data-tl-time]')
  return stamp instanceof HTMLElement ? stamp : li
}

function jumpToward(scroller: HTMLElement, el: HTMLElement, topPad: number): JumpDir {
  const s = scroller.getBoundingClientRect()
  const r = el.getBoundingClientRect()
  const top = s.top + topPad
  if (r.bottom <= top + 2) return 'up'
  if (r.top <= top + 36) return 'here'
  return 'down'
}

export function Timeline({ session }: { session: PrepSession }) {
  const { t } = useLang()
  const hospital = HOSPITALS[session.hospitalId]
  const events = buildTimeline(session)
  const now = new Date()
  const nextEvent = events.find((e) => isAfter(e.at, now))
  const nextId = nextEvent?.id
  const days = useMemo(() => groupByDay(events), [events])
  const saved = loadTimelineUi(session.id, session.date)

  const [view, setView] = useState<TimelineView>(() => saved?.view ?? 'list')
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
  const today = startOfDay(now)
  const scrollDay =
    days.find((g) => isSameDay(g.day, today))?.day ??
    days.find((g) => !isBefore(g.day, today))?.day ??
    days[days.length - 1]?.day
  const rootRef = useRef<HTMLDivElement>(null)
  const todayRef = useRef<HTMLElement>(null)
  const nextRef = useRef<HTMLLIElement>(null)
  const [pane, setPane] = useState<HTMLElement | null>(null)
  const [jumpDir, setJumpDir] = useState<JumpDir>('down')
  const [progress, setProgress] = useState(0)

  const bindRoot = useCallback((node: HTMLDivElement | null) => {
    rootRef.current = node
    const host = node?.closest('[data-app-pane]')
    setPane(host instanceof HTMLElement ? host : null)
  }, [])

  useLayoutEffect(() => {
    const scroller = scrollerOf(rootRef.current)
    if (!scroller) return
    saveTimelineUi(session.id, session.date, { view })

    if (view === 'calendar') {
      scroller.scrollTo({ top: 0, behavior: 'auto' })
      return
    }

    const offset = dayOffset(rootRef.current)
    const eventPad = offset

    const measure = () => {
      const max = scroller.scrollHeight - scroller.clientHeight
      setProgress(max <= 0 ? 0 : Math.min(1, scroller.scrollTop / max))
      const stamp = nextStamp(nextRef.current)
      if (stamp) setJumpDir(jumpToward(scroller, stamp, eventPad))
    }

    const align = () => {
      const remembered = loadTimelineUi(session.id, session.date)
      if (remembered?.landed) {
        scroller.scrollTo({ top: remembered.listTop, behavior: 'auto' })
        measure()
        return
      }
      const nextEl = nextStamp(nextRef.current)
      const el = nextEl ?? todayRef.current
      if (!el) return
      const pad = offset
      scrollToChild(scroller, el, 'auto', pad)
      const pos = el.getBoundingClientRect().top - scroller.getBoundingClientRect().top
      if (pos <= pad + 16) {
        saveTimelineUi(session.id, session.date, { listTop: scroller.scrollTop, view: 'list', landed: true })
      }
      measure()
    }
    align()
    const frames = [requestAnimationFrame(align), requestAnimationFrame(() => requestAnimationFrame(align))]

    const onScroll = () => {
      saveTimelineUi(session.id, session.date, { listTop: scroller.scrollTop, view: 'list' })
      measure()
    }
    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      frames.forEach((id) => cancelAnimationFrame(id))
      scroller.removeEventListener('scroll', onScroll)
    }
  }, [session.id, session.date, view, nextId])

  function jumpToNext() {
    const scroller = scrollerOf(rootRef.current)
    const el = nextStamp(nextRef.current)
    if (!scroller || !el) return
    scrollToChild(scroller, el, 'smooth', dayOffset(rootRef.current))
  }

  return (
    <>
    <div ref={bindRoot} className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 px-5 pt-6">
        <SectionLabel>{t('tl.for', { hospital: hospital.short })}</SectionLabel>
        <h1 className="font-display mt-1 text-[28px] leading-tight text-navy">{t('tl.title')}</h1>
        <p className="mt-1.5 text-[13px] leading-snug text-ink-soft">{t('tl.lead')}</p>
      </div>

      <div data-tl-bar className="shrink-0 bg-paper px-5 py-2">
        <div className="flex rounded-[10px] bg-black/5 p-[3px]">
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
      </div>

      <div data-tl-scroll className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 pb-28">
      {view === 'list' ? (
        <div>
          {days.map((group) => (
            <section
              key={group.day.toISOString()}
              ref={scrollDay && isSameDay(group.day, scrollDay) ? todayRef : undefined}
            >
              <DayHeader day={group.day} procedureDay={procedureDay} />
              <ol
                className={cn(
                  'relative ml-2 border-l pl-5 pt-1',
                  isToday(group.day)
                    ? 'border-teal/40'
                    : isSameDay(group.day, procedureDay)
                      ? 'border-navy/25'
                      : 'border-line',
                )}
              >
                {group.events.map((event) => (
                  <li
                    key={event.id}
                    ref={event.id === nextId ? nextRef : undefined}
                    className="relative overflow-visible pb-4"
                  >
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
                    <EventStamp event={event} />
                    <EventCard event={event} isNext={event.id === nextId} isPast={isBefore(event.at, now)} />
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-2">
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
                    <EventStamp event={event} />
                    <EventCard event={event} isNext={event.id === nextId} isPast={isBefore(event.at, now)} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
    {pane &&
      view === 'list' &&
      nextEvent &&
      createPortal(
        <div data-tl-fab className="pointer-events-none absolute inset-x-0 bottom-3 z-30 flex justify-end px-4">
          <div className="pointer-events-auto">
            <JumpNextFab dir={jumpDir} progress={progress} onClick={jumpToNext} />
          </div>
        </div>,
        pane,
      )}
    </>
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
      data-tl-day={sticky ? '' : undefined}
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

function JumpNextFab({
  dir,
  progress,
  onClick,
}: {
  dir: JumpDir
  progress: number
  onClick: () => void
}) {
  const { t } = useLang()
  const Icon = dir === 'up' ? ArrowUp : ArrowDown
  const r = 20
  const c = 2 * Math.PI * r
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1"
      aria-label={t('tl.jumpNext')}
    >
      <span className="whitespace-nowrap rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-bold tracking-tight text-ink shadow-[0_1px_8px_rgba(28,28,30,0.12)] backdrop-blur-md">
        {t('tl.jumpNext')}
      </span>
      <span className="relative grid h-[52px] w-[52px] place-items-center rounded-full bg-white shadow-[0_4px_18px_rgba(28,28,30,0.16)]">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 52 52" aria-hidden>
          <circle cx="26" cy="26" r={r} fill="none" stroke="#e8e8ed" strokeWidth="2.5" />
          <circle
            cx="26"
            cy="26"
            r={r}
            fill="none"
            stroke="#1c1c1e"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - progress)}
          />
        </svg>
        {dir === 'here' ? (
          <span className="h-3 w-3 rounded-full bg-teal" />
        ) : (
          <Icon size={22} strokeWidth={2.6} className="text-teal-deep" />
        )}
      </span>
    </button>
  )
}

function EventStamp({ event }: { event: TimelineEvent }) {
  return (
    <p data-tl-time className="text-[13px] font-semibold text-navy">
      {format(event.at, 'h:mm a')}
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
    <div data-tl-card className="mt-1">
    <Card
      className={cn(
        'p-3.5 transition',
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
    </div>
  )
}
