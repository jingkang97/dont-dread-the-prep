import { useLayoutEffect, useRef, useState } from 'react'
import { useLang } from '../i18n/LanguageContext'
import { cn } from '../lib/cn'
import { formatHm } from '../lib/dates'

const ITEM_H = 48
const VISIBLE = 3
const PAD = ITEM_H * Math.floor(VISIBLE / 2)

function indexOfTime(times: string[], value: string) {
  const exact = times.indexOf(value)
  if (exact >= 0) return exact
  const toMin = (hm: string) => {
    const [h, m] = hm.split(':').map(Number)
    return h * 60 + (m || 0)
  }
  const target = toMin(value)
  let best = 0
  let bestDelta = Infinity
  times.forEach((t, i) => {
    const delta = Math.abs(toMin(t) - target)
    if (delta < bestDelta) {
      best = i
      bestDelta = delta
    }
  })
  return best
}

export function TimeScroller({
  times,
  value,
  onChange,
  label,
}: {
  times: string[]
  value: string
  onChange: (time: string) => void
  label: string
}) {
  const { lang } = useLang()
  const scrollerRef = useRef<HTMLDivElement>(null)
  const onChangeRef = useRef(onChange)
  const valueRef = useRef(value)
  const settleRef = useRef<number | null>(null)
  const suppressScroll = useRef(false)
  const committed = indexOfTime(times, value)
  const [scrolled, setScrolled] = useState<number | null>(null)
  const center = scrolled ?? committed

  useLayoutEffect(() => {
    onChangeRef.current = onChange
    valueRef.current = value
  })

  useLayoutEffect(() => {
    return () => {
      if (settleRef.current) window.clearTimeout(settleRef.current)
    }
  }, [])

  useLayoutEffect(() => {
    const el = scrollerRef.current
    if (!el || scrolled != null) return
    if (Math.abs(el.scrollTop - committed * ITEM_H) > 2) {
      suppressScroll.current = true
      el.scrollTo({ top: committed * ITEM_H, behavior: 'auto' })
      requestAnimationFrame(() => {
        suppressScroll.current = false
      })
    }
  }, [committed, scrolled])

  function indexFromScroll(el: HTMLElement) {
    return Math.max(0, Math.min(times.length - 1, Math.round(el.scrollTop / ITEM_H)))
  }

  function scrollTo(i: number, behavior: ScrollBehavior) {
    scrollerRef.current?.scrollTo({ top: i * ITEM_H, behavior })
  }

  function commit(i: number) {
    const next = times[Math.max(0, Math.min(times.length - 1, i))]
    if (next && next !== valueRef.current) onChangeRef.current(next)
  }

  function settle() {
    const node = scrollerRef.current
    settleRef.current = null
    if (!node) return
    const i = indexFromScroll(node)
    setScrolled(null)
    commit(i)
  }

  function onScroll() {
    if (suppressScroll.current) return
    const el = scrollerRef.current
    if (!el) return
    setScrolled(indexFromScroll(el))
    if (settleRef.current) window.clearTimeout(settleRef.current)
    settleRef.current = window.setTimeout(settle, 80)
  }

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-2 top-1/2 z-0 h-12 -translate-y-1/2 rounded-2xl bg-cream"
      />
      <div
        ref={scrollerRef}
        role="listbox"
        tabIndex={0}
        aria-label={label}
        aria-activedescendant={times[center] ? `time-${times[center]}` : undefined}
        className="relative z-10 h-[144px] snap-y snap-mandatory overflow-y-auto overscroll-y-contain [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden"
        style={{
          maskImage:
            'linear-gradient(to bottom, transparent, black 22%, black 78%, transparent)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent, black 22%, black 78%, transparent)',
        }}
        onScroll={onScroll}
        onKeyDown={(e) => {
          if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
          e.preventDefault()
          const next = e.key === 'ArrowDown' ? center + 1 : center - 1
          const i = Math.max(0, Math.min(times.length - 1, next))
          setScrolled(null)
          scrollTo(i, 'smooth')
          commit(i)
        }}
      >
        <div className="shrink-0" style={{ height: PAD }} />
        {times.map((time, i) => {
          const selected = i === center
          return (
            <button
              key={time}
              id={`time-${time}`}
              type="button"
              role="option"
              data-demo={`on-time-${time}`}
              aria-selected={selected}
              onClick={() => {
                setScrolled(null)
                scrollTo(i, 'smooth')
                commit(i)
              }}
              className={cn(
                'flex h-12 w-full shrink-0 snap-center snap-always items-center justify-center border-0 bg-transparent p-0 text-[17px] font-semibold',
                selected ? 'text-teal-deep' : 'text-muted',
              )}
            >
              {formatHm(time, lang)}
            </button>
          )
        })}
        <div className="shrink-0" style={{ height: PAD }} />
      </div>
    </div>
  )
}
