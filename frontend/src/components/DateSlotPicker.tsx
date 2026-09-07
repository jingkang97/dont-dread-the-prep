import { addMonths, startOfDay, startOfMonth } from 'date-fns'
import { MonthCalendar } from './MonthCalendar'
import { SegmentedControl } from './SegmentedControl'
import { Card } from './ui'
import { useLang } from '../i18n/LanguageContext'
import { cn } from '../lib/cn'
import { formatHm, formatYmd, isBeforeToday, parseYmd, toYmd } from '../lib/dates'
import { defaultReporting } from '../lib/timeline'
import type { Slot } from '../data/hospitals'

const AM_TIMES = ['07:00', '07:30', '08:00', '08:30', '09:00']
const PM_TIMES = ['12:30', '13:00', '13:30', '14:00', '14:30']

export function DateSlotPicker({
  date,
  slot,
  reportingTime,
  onChange,
  dateLabel,
}: {
  date: string
  slot: Slot | null
  reportingTime: string
  onChange: (next: { date?: string; slot?: Slot; reportingTime?: string }) => void
  dateLabel?: string
}) {
  const { t, lang } = useLang()
  const selected = parseYmd(date)
  const today = startOfDay(new Date())
  const times = slot === 'pm' ? PM_TIMES : AM_TIMES

  return (
    <div>
      <p className="text-[13px] font-semibold text-navy">{dateLabel ?? t('on.date')}</p>
      <p className="font-display mt-1 text-[22px] tracking-tight text-ink">{formatYmd(date, lang)}</p>
      <Card className="mt-3 px-1 py-2">
        <MonthCalendar
          selected={selected}
          onSelect={(day) => {
            const next = toYmd(day)
            if (isBeforeToday(next)) return
            onChange({ date: next })
          }}
          disabledBefore={today}
          startMonth={startOfMonth(today)}
          endMonth={startOfMonth(addMonths(today, 18))}
        />
      </Card>

      <p className="mt-5 text-[13px] font-semibold text-navy">{t('on.session')}</p>
      <SegmentedControl
        value={slot ?? 'am'}
        onChange={(id) => onChange({ slot: id, reportingTime: defaultReporting(id) })}
        className="mt-2 rounded-[12px]"
        buttonClassName="min-h-[48px] px-2 py-2"
        options={[
          {
            id: 'am',
            label: (
              <>
                <span className="block text-[15px] font-semibold">{t('on.am')}</span>
                <span className="block text-[11px] font-normal">{t('on.amHint')}</span>
              </>
            ),
          },
          {
            id: 'pm',
            label: (
              <>
                <span className="block text-[15px] font-semibold">{t('on.pm')}</span>
                <span className="block text-[11px] font-normal">{t('on.pmHint')}</span>
              </>
            ),
          },
        ]}
      />

      <p className="mt-5 text-[13px] font-semibold text-navy">{t('on.report')}</p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {times.map((time) => (
          <button
            key={time}
            type="button"
            onClick={() => onChange({ reportingTime: time, slot: slot ?? (time < '12:00' ? 'am' : 'pm') })}
            className={cn(
              'min-h-[48px] rounded-2xl text-[15px] font-semibold',
              reportingTime === time ? 'bg-navy text-white' : 'bg-white text-ink',
            )}
          >
            {formatHm(time)}
          </button>
        ))}
      </div>
    </div>
  )
}
