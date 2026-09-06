import { format } from 'date-fns'
import type { TimelineEvent } from '../../lib/timeline'

export function EventStamp({ event }: { event: TimelineEvent }) {
  return (
    <p data-tl-time className="text-[13px] font-semibold text-navy">
      {format(event.at, 'h:mm a')}
    </p>
  )
}
