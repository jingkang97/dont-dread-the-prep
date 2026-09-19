import { format } from 'date-fns'
import { LangSwitch } from './LangSwitch'
import { useLang } from '../i18n/LanguageContext'
import { DATE_LOCALES } from '../lib/dateLocale'
import { formatByLang, parseYmd, sessionReportAt } from '../lib/dates'
import type { PrepSession } from '../lib/session'

export function SessionBar({
  session,
  onChange,
  onReplayTour,
}: {
  session: PrepSession
  onChange: () => void
  onReplayTour?: () => void
}) {
  const { t, lang, tx } = useLang()
  const locale = DATE_LOCALES[lang]
  const when = formatByLang(sessionReportAt(session), lang, 'sessionWhenCompact')
  const weekday = format(parseYmd(session.date), 'EEEE', { locale })
  const slot = session.slot === 'am' ? t('on.morning') : t('on.afternoon')

  return (
    <div
      data-tour="session-bar"
      className="flex shrink-0 items-center gap-1.5 border-b border-black/5 bg-white px-3 py-2"
    >
      <div className="min-w-0 flex-1 pl-1">
        <p className="text-[14px] font-semibold leading-snug text-ink">
          {tx(session.hospitalShort)} · {when}
        </p>
        <p className="text-[12px] leading-tight text-muted">
          {weekday} · {slot}
        </p>
      </div>
      {onReplayTour ? (
        <button
          type="button"
          onClick={onReplayTour}
          aria-label={t('tour.replay')}
          className="min-h-11 shrink-0 rounded-full px-2 text-[15px] font-semibold text-teal-deep active:bg-cream"
        >
          {t('tour.replayShort')}
        </button>
      ) : null}
      <button
        type="button"
        onClick={onChange}
        className="min-h-11 shrink-0 rounded-full px-2 text-[15px] font-semibold text-teal-deep active:bg-cream"
      >
        {t('app.change')}
      </button>
      <LangSwitch compact />
    </div>
  )
}
