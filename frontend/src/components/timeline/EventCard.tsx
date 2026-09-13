import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence } from 'motion/react'
import { ArrowRight, CircleHelp } from 'lucide-react'
import { Card } from '../ui'
import { useLang } from '../../i18n/LanguageContext'
import { cn } from '../../lib/cn'
import { fromNowDays, resolveEventText, type TimelineEvent } from '../../lib/timeline'
import { KIND_KEY, KIND_TONE } from './kinds'
import { PicoprepMixSheet } from './PicoprepMixSheet'
import { PegMixSheet } from './PegMixSheet'

function mixAgent(event: TimelineEvent) {
  if (event.kind !== 'dose') return null
  if (event.agent === 'peg') {
    return event.prepImageLabel ? 'peg' : null
  }
  return 'picoprep'
}

export function EventCard({
  event,
  isNext,
  isPast,
  onOpenStool,
}: {
  event: TimelineEvent
  isNext?: boolean
  isPast?: boolean
  onOpenStool?: () => void
}) {
  const { t } = useLang()
  const { title, detail } = resolveEventText(event, t)
  const cardRef = useRef<HTMLDivElement>(null)
  const [pane, setPane] = useState<HTMLElement | null>(null)
  const [mixOpen, setMixOpen] = useState(false)
  const mix = mixAgent(event)
  const stoolLink = event.kind === 'stool' && onOpenStool
  const until = isNext ? fromNowDays(event.at, new Date(), t) : ''

  useLayoutEffect(() => {
    const host = cardRef.current?.closest('[data-app-pane]')
    setPane(host instanceof HTMLElement ? host : null)
  }, [])

  const card = (
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
        {isNext && (
          <span className="rounded-full bg-teal/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-deep">
            {t('tl.next')}
          </span>
        )}
        {event.tentative && (
          <span className="text-[10px] font-bold tracking-wide text-ask">{t('tl.notOnForm')}</span>
        )}
        {(until || mix) && (
          <span className="ml-auto flex shrink-0 items-center gap-1">
            {until ? (
              <span className="text-[12px] font-semibold text-teal-deep">{until}</span>
            ) : null}
            {mix && (
              <button
                type="button"
                aria-label={t(mix === 'peg' ? 'tl.pegMixHint' : 'tl.mixHint')}
                onClick={() => setMixOpen(true)}
                className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-teal-deep transition active:bg-teal/15"
              >
                <CircleHelp size={18} strokeWidth={2.2} />
              </button>
            )}
          </span>
        )}
      </div>
      <p className="mt-1.5 text-[16px] font-semibold text-ink">{title}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{detail}</p>
      {stoolLink && (
        <p className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-ask">
          {t('tl.openStool')} <ArrowRight size={16} />
        </p>
      )}
    </Card>
  )

  return (
    <div ref={cardRef} data-tl-card className="mt-1">
      {stoolLink ? (
        <button type="button" onClick={onOpenStool} className="w-full text-left">
          {card}
        </button>
      ) : (
        card
      )}
      {pane &&
        createPortal(
          <AnimatePresence>
            {mixOpen && mix === 'peg' ? (
              <PegMixSheet onClose={() => setMixOpen(false)} prepImageLabel={event.prepImageLabel} />
            ) : mixOpen && mix === 'picoprep' ? (
              <PicoprepMixSheet onClose={() => setMixOpen(false)} />
            ) : null}
          </AnimatePresence>,
          pane,
        )}
    </div>
  )
}
