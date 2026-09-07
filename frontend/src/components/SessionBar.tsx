import { HOSPITALS } from '../data/hospitals'
import { useLang } from '../i18n/LanguageContext'
import { formatSessionWhen } from '../lib/dates'
import type { PrepSession } from '../lib/session'

export function SessionBar({
  session,
  onChange,
}: {
  session: PrepSession
  onChange: () => void
}) {
  const { t, lang } = useLang()
  const hospital = HOSPITALS[session.hospitalId]
  const when = formatSessionWhen(session, lang)
  const slot = session.slot === 'am' ? t('on.morning') : t('on.afternoon')

  return (
    <div
      data-tour="session-bar"
      className="flex h-14 shrink-0 items-center gap-3 border-b border-black/5 bg-white px-3"
    >
      <div className="min-w-0 flex-1 pl-1">
        <p className="truncate text-[15px] font-semibold leading-tight text-ink">
          {session.firstName ? `${session.firstName} · ` : ''}
          {hospital.short} · {slot}
        </p>
        <p className="truncate text-[12px] leading-tight text-muted">
          {when} · {session.id}
        </p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className="min-h-[44px] shrink-0 rounded-full px-4 text-[16px] font-semibold text-teal-deep active:bg-cream"
      >
        {t('app.change')}
      </button>
    </div>
  )
}
