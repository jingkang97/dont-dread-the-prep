import { format } from 'date-fns'
import { useLang } from '../../i18n/LanguageContext'
import type { TimelineEvent } from '../../lib/timeline'

export function EventStamp({ event }: { event: TimelineEvent }) {
  const { t } = useLang()
  return (
    <p data-tl-time className="text-[13px] font-semibold text-navy">
      {event.allDay ? t('tl.allDay') : format(event.at, 'h:mm a')}
    </p>
  )
}
