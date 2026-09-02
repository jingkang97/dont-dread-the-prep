import { DayPicker } from 'react-day-picker'
import { enGB, ms, ta, zhCN } from 'react-day-picker/locale'
import { useLang } from '../i18n/LanguageContext'
import { cn } from '../lib/cn'

const LOCALES = { en: enGB, zh: zhCN, ms, ta } as const

export function MonthCalendar({
  selected,
  onSelect,
  eventDays,
  procedureDay,
  startMonth,
  endMonth,
  className,
}: {
  selected?: Date
  onSelect: (day: Date) => void
  eventDays?: Date[]
  procedureDay?: Date
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
        locale={LOCALES[lang]}
        weekStartsOn={1}
        navLayout="around"
        hideNavigation={Boolean(oneMonth)}
        startMonth={startMonth}
        endMonth={endMonth}
        defaultMonth={selected}
        modifiers={{
          hasEvent: eventDays,
          procedure: procedureDay,
        }}
        modifiersClassNames={{
          hasEvent: 'pp-has-event',
          procedure: 'pp-procedure',
        }}
      />
    </div>
  )
}
