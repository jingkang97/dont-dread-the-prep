import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'motion/react'
import { isAfter, isBefore, isSameDay, isToday, startOfDay, startOfMonth } from 'date-fns'
import { MonthCalendar } from '../components/MonthCalendar'
import { Card } from '../components/ui'
import { DayHeader } from '../components/timeline/DayHeader'
import { EventCard } from '../components/timeline/EventCard'
import { EventStamp } from '../components/timeline/EventStamp'
import { JumpNextFab, type JumpDir } from '../components/timeline/JumpNextFab'
import { useLang } from '../i18n/LanguageContext'
import { timelineLiveCopy, usePrimeLiveCopy } from '../i18n/liveCopy'
import type { PrepSession } from '../lib/session'
import { parseYmd } from '../lib/dates'
import { isEventPast, type TimelineEvent } from '../lib/timeline'
import { loadTimelineUi, saveTimelineUi, type TimelineView } from '../lib/timelineUi'
import { cn } from '../lib/cn'
import { SegmentedControl } from '../components/SegmentedControl'
import { usePrepSummary } from '../hooks/usePrepSummary'

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

export function Timeline({
  session,
  onOpenStool,
  onOpenFood,
}: {
  session: PrepSession
  onOpenStool: () => void
  onOpenFood: () => void
}) {
  const { t, tx } = useLang()
  const { events, loading, error, now, nextUpcoming } = usePrepSummary(session)
  usePrimeLiveCopy(timelineLiveCopy(events))
  const nextId = nextUpcoming?.id
  const days = useMemo(() => groupByDay(events), [events])
  const saved = loadTimelineUi(session.id, session.date)

  const [view, setView] = useState<TimelineView>(() => saved?.view ?? 'list')
  const procedureDay = useMemo(() => parseYmd(session.date), [session.date])
  const [picked, setPicked] = useState(() => {
    const today = startOfDay(new Date())
    const scope = parseYmd(session.date)
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
      <div data-tl-bar className="shrink-0 bg-paper px-5 pt-3 pb-2">
        <SegmentedControl
          group="tl-view"
          value={view}
          onChange={setView}
          buttonClassName="py-1.5"
          options={[
            { id: 'list', label: t('tl.list') },
            { id: 'calendar', label: t('tl.calendar') },
          ]}
        />
      </div>

      <div data-tl-scroll className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 pb-28">
      {loading && events.length === 0 ? (
        <p className="mt-6 text-[14px] text-muted">{t('app.regenerating')}</p>
      ) : null}
      {!loading && error ? (
        <p className="mt-6 text-[14px] text-no">{tx(error)}</p>
      ) : null}
      {!loading && !error && events.length === 0 ? (
        <p className="mt-6 text-[14px] text-muted">{t('tl.noEvents')}</p>
      ) : null}
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
                        isEventPast(event, now) ? 'bg-muted' : event.tentative ? 'bg-ask' : 'bg-teal',
                      )}
                    />
                    <EventStamp event={event} />
                    <EventCard
                      event={event}
                      isNext={event.id === nextId}
                      isPast={isEventPast(event, now)}
                      onOpenStool={onOpenStool}
                      onOpenFood={onOpenFood}
                    />
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
            <div className="mt-3 mx-auto grid w-max max-w-full grid-cols-2 items-center gap-x-6 gap-y-2 px-2 pb-1 text-[11px] font-semibold text-muted">
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
                <span className="flex flex-col items-center gap-[3px]">
                  <span className="text-[11px] font-bold leading-none text-ink">12</span>
                  <span className="h-[5px] w-[5px] rounded-full bg-teal" />
                </span>
                {t('tl.hasSteps')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-navy text-[11px] font-bold text-white">
                  12
                </span>
                {t('tl.scopeDay')}
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
                    <EventCard
                      event={event}
                      isNext={event.id === nextId}
                      isPast={isEventPast(event, now)}
                      onOpenStool={onOpenStool}
                      onOpenFood={onOpenFood}
                    />
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
      nextUpcoming &&
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
