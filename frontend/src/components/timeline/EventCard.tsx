import { Card } from '../ui'
import { useLang } from '../../i18n/LanguageContext'
import { cn } from '../../lib/cn'
import { resolveEventText, type TimelineEvent } from '../../lib/timeline'
import { KIND_KEY, KIND_TONE } from './kinds'

export function EventCard({
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
