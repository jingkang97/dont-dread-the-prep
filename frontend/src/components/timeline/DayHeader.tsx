import { isSameDay, isToday } from 'date-fns'
import { useLang } from '../../i18n/LanguageContext'
import { cn } from '../../lib/cn'
import { formatByLang } from '../../lib/dates'
import { fromNowDays } from '../../lib/timeline'

export function DayHeader({
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
      <span className="min-w-0 truncate">{formatByLang(day, lang, 'dayHeader')}</span>
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
