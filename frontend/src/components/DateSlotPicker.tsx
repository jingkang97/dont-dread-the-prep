import { addMonths, format, startOfMonth } from 'date-fns'
import { MonthCalendar } from './MonthCalendar'
import { SegmentedControl } from './SegmentedControl'
import { Card } from './ui'
import { useLang } from '../i18n/LanguageContext'
import { cn } from '../lib/cn'
import { DATE_LOCALES } from '../lib/dateLocale'
import { defaultReporting } from '../lib/timeline'
import type { Slot } from '../data/hospitals'

const AM_TIMES = ['07:00', '07:30', '08:00', '08:30', '09:00']
const PM_TIMES = ['12:30', '13:00', '13:30', '14:00', '14:30']

function parseYmd(s: string) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function timeLabel(hm: string) {
  const [h, min] = hm.split(':').map(Number)
  return format(new Date(2000, 0, 1, h, min), 'h:mm a')
}

export function DateSlotPicker({
  date,
  slot,
  reportingTime,
  onChange,
}: {
  date: string
  slot: Slot | null
  reportingTime: string
  onChange: (next: { date?: string; slot?: Slot; reportingTime?: string }) => void
}) {
  const { t, lang } = useLang()
  const selected = parseYmd(date)
  const times = slot === 'pm' ? PM_TIMES : AM_TIMES

  return (
    <div>
      <p className="text-[13px] font-semibold text-navy">{t('on.date')}</p>
      <p className="font-display mt-1 text-[22px] tracking-tight text-ink">{format(selected, 'EEE d MMM yyyy', { locale: DATE_LOCALES[lang] })}</p>
      <Card className="mt-3 px-1 py-2">
        <MonthCalendar
          selected={selected}
          onSelect={(day) => onChange({ date: format(day, 'yyyy-MM-dd') })}
          startMonth={startOfMonth(addMonths(new Date(), -1))}
          endMonth={startOfMonth(addMonths(new Date(), 18))}
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
            {timeLabel(time)}
          </button>
        ))}
      </div>
    </div>
  )
}
