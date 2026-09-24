import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown, Pause, Play, Repeat, RotateCcw, Square } from 'lucide-react'
import { cn } from '../lib/cn'
import { easeOut } from '../lib/motion'
import { useDemo } from './DemoContext'
import type { DemoStepInfo } from './script'

const SPEEDS = [0.75, 1, 1.5]

export function DemoPlayer() {
  const demo = useDemo()
  const [open, setOpen] = useState(true)
  const [stepsOpen, setStepsOpen] = useState(true)
  const currentRef = useRef<HTMLButtonElement | null>(null)
  if (!demo.enabled) return null

  const live = demo.status === 'playing' || demo.status === 'paused'
  const current = live ? demo.stepIndex : demo.status === 'done' ? demo.steps.length : 0

  return (
    <>
      <DemoSpotlight />
      <div className="pointer-events-none fixed inset-0 z-[90] xl:right-[430px]">
        <div className="pointer-events-auto absolute top-[max(12px,env(safe-area-inset-top))] right-3 left-3 flex justify-end xl:top-6 xl:right-6 xl:left-auto">
          <div className="flex w-full max-w-[340px] flex-col items-end">
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                <motion.div
                  key="panel"
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.22, ease: easeOut }}
                  className="flex max-h-[min(78vh,720px)] w-full origin-top-right flex-col overflow-hidden rounded-3xl bg-navy text-white shadow-[0_12px_40px_rgba(0,0,0,0.28)] ring-1 ring-white/10"
                >
                <div className="shrink-0 px-3.5 pt-3 pb-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold tracking-wide text-teal">DEMO PLAYER</p>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="text-[11px] font-semibold text-white/50"
                    >
                      Hide
                    </button>
                  </div>
                  <p className="mt-1 truncate text-[14px] font-semibold">
                    {demo.status === 'idle' ? 'Ready' : demo.stepLabel}
                  </p>
                  <p className="text-[11px] text-white/45">
                    {live || demo.status === 'done'
                      ? `${demo.stepFeature ? `${demo.stepFeature} · ` : ''}${Math.min(demo.stepIndex + (live ? 1 : 0), demo.stepCount)} / ${demo.stepCount}`
                      : demo.loop
                        ? 'Loop is on. Hide to run in the background.'
                        : 'Play starts at Choose hospital. Tap a step to jump there.'}
                  </p>
                  <div className="mt-3 flex items-center gap-1.5">
                    {demo.status === 'playing' ? (
                      <IconBtn label="Pause" onClick={demo.pause}>
                        <Pause size={16} />
                      </IconBtn>
                    ) : (
                      <IconBtn label="Play" onClick={demo.play} accent>
                        <Play size={16} />
                      </IconBtn>
                    )}
                    <IconBtn label="Stop" onClick={demo.stop} disabled={demo.status === 'idle'}>
                      <Square size={14} />
                    </IconBtn>
                    <IconBtn label="Restart" onClick={demo.restart}>
                      <RotateCcw size={15} />
                    </IconBtn>
                    <IconBtn
                      label={demo.loop ? 'Loop on' : 'Loop off'}
                      onClick={() => demo.setLoop(!demo.loop)}
                      accent={demo.loop}
                    >
                      <Repeat size={15} />
                    </IconBtn>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setStepsOpen((v) => !v)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-white/55"
                    >
                      Steps
                      <ChevronDown
                        size={14}
                        className={cn('transition-transform duration-200 ease-out', stepsOpen && 'rotate-180')}
                      />
                    </button>
                    <div className="flex gap-1">
                      {SPEEDS.map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => demo.setSpeed(n)}
                          className={cn(
                            'rounded-full px-2 py-1 text-[11px] font-semibold',
                            demo.speed === n ? 'bg-teal text-navy' : 'bg-white/10 text-white/70',
                          )}
                        >
                          {n}×
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <AnimatePresence initial={false}>
                  {stepsOpen ? (
                    <motion.div
                      key="steps"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.26, ease: easeOut }}
                      className="min-h-0 overflow-hidden pb-2.5"
                    >
                      <StepList
                        key={demo.runNonce}
                        steps={demo.steps}
                        current={current}
                        currentRef={currentRef}
                        onPick={demo.playFrom}
                      />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.button
                key="pill"
                type="button"
                onClick={() => setOpen(true)}
                initial={{ opacity: 0, y: -6, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.92 }}
                transition={{ duration: 0.2, ease: easeOut }}
                className="origin-top-right rounded-full bg-navy px-3 py-2 text-[12px] font-semibold text-teal shadow-lg ring-1 ring-white/10"
              >
                Demo
              </motion.button>
            )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  )
}

function StepList({
  steps,
  current,
  currentRef,
  onPick,
}: {
  steps: DemoStepInfo[]
  current: number
  currentRef: RefObject<HTMLButtonElement | null>
  onPick: (index: number) => void
}) {
  const listRef = useRef<HTMLOListElement | null>(null)

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    if (current <= 0) {
      list.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const chip = currentRef.current
    if (!chip) return
    const frame = window.requestAnimationFrame(() => scrollChipFullyVisible(list, chip))
    return () => window.cancelAnimationFrame(frame)
  }, [current, currentRef])

  const groups: { feature: string; items: { step: DemoStepInfo; index: number }[] }[] = []
  for (let i = 0; i < steps.length; i++) {
    const last = groups[groups.length - 1]
    if (last && last.feature === steps[i].feature) last.items.push({ step: steps[i], index: i })
    else groups.push({ feature: steps[i].feature, items: [{ step: steps[i], index: i }] })
  }

  return (
    <ol
      ref={listRef}
      className="max-h-[min(46vh,380px)] overflow-y-auto overscroll-contain border-t border-white/10 px-2 pt-2 pb-4"
    >
      {groups.map((group) => (
        <li key={group.feature + group.items[0].index} className="mb-2 last:mb-0">
          <p className="px-2 pb-1 pt-1 text-[10px] font-semibold tracking-wide text-teal/90">
            {group.feature}
          </p>
          <ol>
            {group.items.map(({ step, index }) => {
              const active = index === current
              return (
                <li key={step.id}>
                  <button
                    type="button"
                    ref={active ? currentRef : undefined}
                    aria-current={active ? 'step' : undefined}
                    onClick={() => onPick(index)}
                    className={cn(
                      'flex w-full items-baseline gap-2 rounded-xl px-2 py-1.5 text-left scroll-my-5',
                      active ? 'bg-teal/20 ring-1 ring-teal/50' : 'hover:bg-white/8',
                    )}
                  >
                    <span
                      className={cn(
                        'w-4 shrink-0 text-[11px] font-semibold',
                        active ? 'text-teal' : 'text-white/35',
                      )}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={cn(
                        'min-w-0 text-[13px] leading-snug',
                        active ? 'font-semibold text-white' : 'text-white/75',
                      )}
                    >
                      {step.label}
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </li>
      ))}
    </ol>
  )
}

function scrollChipFullyVisible(list: HTMLElement, chip: HTMLElement) {
  const pad = 20
  const listBox = list.getBoundingClientRect()
  const chipBox = chip.getBoundingClientRect()
  const above = listBox.top + pad - chipBox.top
  const below = chipBox.bottom + pad - listBox.bottom
  if (above > 0) list.scrollBy({ top: -above, behavior: 'smooth' })
  else if (below > 0) list.scrollBy({ top: below, behavior: 'smooth' })
}

function IconBtn({
  label,
  onClick,
  children,
  accent,
  disabled,
}: {
  label: string
  onClick: () => void
  children: ReactNode
  accent?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full disabled:opacity-35',
        accent ? 'bg-teal text-navy' : 'bg-white/10 text-white',
      )}
    >
      {children}
    </button>
  )
}

function DemoSpotlight() {
  const { target } = useDemo()
  const [box, setBox] = useState<{ top: number; left: number; width: number; height: number } | null>(
    null,
  )

  useEffect(() => {
    if (!target) {
      setBox(null)
      return
    }
    const host = document.querySelector('[data-app-column]')
    if (!(host instanceof HTMLElement)) return

    let frame = 0
    const measure = () => {
      const column = host.getBoundingClientRect()
      const rect = target.getBoundingClientRect()
      const next = {
        top: rect.top - column.top - 6,
        left: rect.left - column.left - 6,
        width: rect.width + 12,
        height: rect.height + 12,
      }
      setBox((prev) =>
        prev &&
        Math.abs(prev.top - next.top) < 0.5 &&
        Math.abs(prev.left - next.left) < 0.5 &&
        Math.abs(prev.width - next.width) < 0.5 &&
        Math.abs(prev.height - next.height) < 0.5
          ? prev
          : next,
      )
      frame = window.requestAnimationFrame(measure)
    }
    measure()
    return () => window.cancelAnimationFrame(frame)
  }, [target])

  const host = typeof document !== 'undefined' ? document.querySelector('[data-app-column]') : null
  if (!(host instanceof HTMLElement) || !box) return null

  return createPortal(
    <span
      aria-hidden
      className="demo-ring"
      style={{
        top: box.top,
        left: box.left,
        width: box.width,
        height: box.height,
      }}
    />,
    host,
  )
}
