import { useState } from 'react'
import { HOSPITALS } from '../data/hospitals'
import { DateSlotPicker } from './DateSlotPicker'
import { PrimaryButton } from './ui'
import { useLang } from '../i18n/LanguageContext'
import type { PrepSession } from '../lib/session'
import type { Slot } from '../data/hospitals'

export function AppointmentChooser({
  hospitalShort,
  slot,
  when,
  onChangeDate,
  onStartOver,
  onKeep,
}: {
  hospitalShort: string
  slot: 'am' | 'pm'
  when: string
  onChangeDate: () => void
  onStartOver: () => void
  onKeep: () => void
}) {
  const { t } = useLang()
  const slotLabel = slot === 'am' ? t('on.morning') : t('on.afternoon')
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center px-4">
      <button type="button" aria-label={t('app.keep')} className="absolute inset-0 bg-black/40" onClick={onKeep} />
      <div className="relative w-full rounded-[24px] bg-white p-5 shadow-xl">
        <p className="font-display text-[22px] leading-tight tracking-tight text-ink">
          {hospitalShort} · {slotLabel}
        </p>
        <p className="mt-1 text-[15px] text-ink-soft">{when}</p>
        <button
          type="button"
          onClick={onChangeDate}
          className="mt-5 min-h-[56px] w-full rounded-[18px] bg-paper px-4 py-3 text-left"
        >
          <span className="block text-[17px] font-semibold text-ink">{t('app.changeDate')}</span>
          <span className="mt-0.5 block text-[13px] text-muted">{t('app.changeDateHint', { hospital: hospitalShort })}</span>
        </button>
        <button
          type="button"
          onClick={onStartOver}
          className="mt-2 min-h-[56px] w-full rounded-[18px] bg-paper px-4 py-3 text-left"
        >
          <span className="block text-[17px] font-semibold text-ink">{t('app.startOver')}</span>
          <span className="mt-0.5 block text-[13px] text-muted">{t('app.startOverHint')}</span>
        </button>
        <button
          type="button"
          onClick={onKeep}
          className="mt-3 min-h-[48px] w-full rounded-full bg-navy px-4 text-[17px] font-semibold text-white"
        >
          {t('app.keep')}
        </button>
      </div>
    </div>
  )
}

export function StartOverSheet({
  onBack,
  onConfirm,
}: {
  onBack: () => void
  onConfirm: () => void
}) {
  const { t } = useLang()
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center px-4">
      <button type="button" aria-label={t('on.back')} className="absolute inset-0 bg-black/40" onClick={onBack} />
      <div className="relative w-full rounded-[24px] bg-white p-5 shadow-xl">
        <p className="font-display text-[22px] leading-tight tracking-tight text-ink">{t('app.startOverTitle')}</p>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{t('app.startOverBody')}</p>
        <div className="mt-5 grid gap-2">
          <PrimaryButton onClick={onConfirm}>{t('app.startOverConfirm')}</PrimaryButton>
          <button
            type="button"
            onClick={onBack}
            className="min-h-[48px] w-full rounded-full bg-paper px-4 text-[17px] font-semibold text-ink"
          >
            {t('on.back')}
          </button>
        </div>
      </div>
    </div>
  )
}

export function ChangeDatePanel({
  session,
  onCancel,
  onSave,
}: {
  session: PrepSession
  onCancel: () => void
  onSave: (next: { date: string; slot: Slot; reportingTime: string }) => void
}) {
  const { t } = useLang()
  const hospital = HOSPITALS[session.hospitalId]
  const [date, setDate] = useState(session.date)
  const [slot, setSlot] = useState<Slot>(session.slot)
  const [reportingTime, setReportingTime] = useState(session.reportingTime)

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-paper">
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-5">
        <p className="text-[13px] font-semibold text-muted">{t('app.stayingAt', { hospital: hospital.short })}</p>
        <h2 className="font-display mt-1 text-[22px] text-ink">{t('app.dateTitle')}</h2>
        <div className="mt-4">
          <DateSlotPicker
            date={date}
            slot={slot}
            reportingTime={reportingTime}
            onChange={(next) => {
              if (next.date) setDate(next.date)
              if (next.slot) setSlot(next.slot)
              if (next.reportingTime) setReportingTime(next.reportingTime)
            }}
          />
        </div>
        <div className="mt-5 grid gap-2">
          <PrimaryButton onClick={() => onSave({ date, slot, reportingTime })}>{t('app.saveDate')}</PrimaryButton>
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[48px] w-full rounded-full bg-white px-4 text-[17px] font-semibold text-ink"
          >
            {t('on.back')}
          </button>
        </div>
      </div>
    </div>
  )
}
