import { useLang } from '../i18n/LanguageContext'
import { formatSessionWhen } from '../lib/dates'
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
  const { t, lang } = useLang()
  const when = formatSessionWhen(session, lang)
  const slot = session.slot === 'am' ? t('on.morning') : t('on.afternoon')

  return (
    <div
      data-tour="session-bar"
      className="flex h-14 shrink-0 items-center gap-2 border-b border-black/5 bg-white px-3"
    >
      <div className="min-w-0 flex-1 pl-1">
        <p className="truncate text-[15px] font-semibold leading-tight text-ink">
          {session.firstName ? `${session.firstName} · ` : ''}
          {session.hospitalShort} · {slot}
        </p>
        <p className="truncate text-[12px] leading-tight text-muted">
          {when}
        </p>
      </div>
      {onReplayTour ? (
        <button
          type="button"
          onClick={onReplayTour}
          aria-label={t('tour.replay')}
          className="min-h-[44px] shrink-0 rounded-full px-3 text-[16px] font-semibold text-teal-deep active:bg-cream"
        >
          {t('tour.replayShort')}
        </button>
      ) : null}
      <button
        type="button"
        onClick={onChange}
        className="min-h-[44px] shrink-0 rounded-full px-3 text-[16px] font-semibold text-teal-deep active:bg-cream"
      >
        {t('app.change')}
      </button>
    </div>
  )
}
