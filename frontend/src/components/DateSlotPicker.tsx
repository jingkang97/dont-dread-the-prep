import { addMonths, startOfDay, startOfMonth } from 'date-fns'
import { MonthCalendar } from './MonthCalendar'
import { SegmentedControl } from './SegmentedControl'
import { TimeScroller } from './TimeScroller'
import { Card } from './ui'
import { useLang } from '../i18n/LanguageContext'
import { isBeforeToday, parseYmd, quarterHours, toYmd } from '../lib/dates'
import { defaultReporting } from '../lib/timeline'
import type { Slot } from '../data/hospitals'

const AM_TIMES = quarterHours('08:00', '11:45')
const PM_TIMES = quarterHours('12:00', '17:00')

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
  const { t } = useLang()
  const selected = parseYmd(date)
  const today = startOfDay(new Date())
  const times = slot === 'pm' ? PM_TIMES : AM_TIMES

  return (
    <div>
      {dateLabel ? <p className="text-[13px] font-semibold text-navy">{dateLabel}</p> : null}
      <Card className={dateLabel ? 'mt-3 px-1 py-2' : 'px-1 py-2'}>
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
      <Card className="mt-2 overflow-hidden py-1">
        <TimeScroller
          key={slot ?? 'am'}
          times={times}
          value={reportingTime}
          label={t('on.report')}
          onChange={(time) =>
            onChange({ reportingTime: time, slot: slot ?? (time < '12:00' ? 'am' : 'pm') })
          }
        />
      </Card>
    </div>
  )
}
