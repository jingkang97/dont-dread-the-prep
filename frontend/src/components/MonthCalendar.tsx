import { startOfDay } from 'date-fns'
import { DayPicker, type Matcher } from 'react-day-picker'
import { useLang } from '../i18n/LanguageContext'
import { cn } from '../lib/cn'
import { DATE_LOCALES } from '../lib/dateLocale'
import { toYmd } from '../lib/dates'

export function MonthCalendar({
  selected,
  onSelect,
  eventDays,
  procedureDay,
  disabledBefore,
  disabledAfter,
  startMonth,
  endMonth,
  className,
}: {
  selected?: Date
  onSelect: (day: Date) => void
  eventDays?: Date[]
  procedureDay?: Date
  /** Days before this one are dimmed and unselectable. */
  disabledBefore?: Date
  /** Days after this one are dimmed and unselectable — nothing is scheduled past the scope. */
  disabledAfter?: Date
  startMonth?: Date
  endMonth?: Date
  className?: string
}) {
  const { lang } = useLang()
  const oneMonth =
    startMonth &&
    endMonth &&
    startMonth.getFullYear() === endMonth.getFullYear() &&
    startMonth.getMonth() === endMonth.getMonth()

  const disabled: Matcher[] = []
  if (disabledBefore) disabled.push({ before: startOfDay(disabledBefore) })
  if (disabledAfter) disabled.push({ after: disabledAfter })

  return (
    <div className={cn('pp-cal', className)}>
      <DayPicker
        mode="single"
        required
        animate={false}
        selected={selected}
        onSelect={(day) => {
          if (day) onSelect(day)
        }}
        locale={DATE_LOCALES[lang]}
        weekStartsOn={1}
        navLayout="around"
        hideNavigation={Boolean(oneMonth)}
        startMonth={startMonth}
        endMonth={endMonth}
        defaultMonth={selected}
        disabled={disabled.length ? disabled : undefined}
        modifiers={{
          hasEvent: eventDays,
          procedure: procedureDay,
        }}
        modifiersClassNames={{
          hasEvent: 'pp-has-event',
          procedure: 'pp-procedure',
        }}
        components={{
          DayButton: ({ day, modifiers: _modifiers, ...props }) => (
            <button {...props} data-demo={`cal-${toYmd(day.date)}`} />
          ),
        }}
      />
    </div>
  )
}
