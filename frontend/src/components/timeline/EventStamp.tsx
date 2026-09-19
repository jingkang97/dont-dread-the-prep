import { useLang } from '../../i18n/LanguageContext'
import { formatByLang } from '../../lib/dates'
import type { TimelineEvent } from '../../lib/timeline'

export function EventStamp({ event }: { event: TimelineEvent }) {
  const { t, lang } = useLang()
  return (
    <p data-tl-time className="text-[13px] font-semibold text-navy">
      {event.allDay ? t('tl.allDay') : formatByLang(event.at, lang, 'time')}
    </p>
  )
}
