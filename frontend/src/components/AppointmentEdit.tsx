import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { DateSlotPicker } from './DateSlotPicker'
import { SheetFrame } from './sheets/SheetFrame'
import { GeneratingPane, PrimaryButton } from './ui'
import { useLang } from '../i18n/LanguageContext'
import { fadeY } from '../lib/motion'
import type { PrepSession } from '../lib/session'
import type { Slot } from '../data/hospitals'

export function AppointmentChooser({
  session,
  when,
  onChangeDate,
  onStartOver,
  onKeep,
}: {
  session: PrepSession
  when: string
  onChangeDate: () => void
  onStartOver: () => void
  onKeep: () => void
}) {
  const { t } = useLang()
  const hospital = session.hospitalShort
  const slotLabel = session.slot === 'am' ? t('on.morning') : t('on.afternoon')
  return (
    <SheetFrame onDismiss={onKeep} dismissLabel={t('app.keep')}>
      <p className="font-display text-[22px] leading-tight tracking-tight text-ink">
        {hospital} · {slotLabel}
      </p>
      <p className="mt-1 text-[15px] text-ink-soft">{when}</p>
      <button
        type="button"
        onClick={onChangeDate}
        className="mt-5 min-h-[56px] w-full rounded-[18px] bg-paper px-4 py-3 text-left"
      >
        <span className="block text-[17px] font-semibold text-ink">{t('app.changeDate')}</span>
        <span className="mt-0.5 block text-[13px] text-muted">{t('app.changeDateHint', { hospital })}</span>
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
    </SheetFrame>
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
    <SheetFrame onDismiss={onBack} dismissLabel={t('on.back')}>
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
    </SheetFrame>
  )
}

export function ChangeDatePanel({
  session,
  error,
  busy = false,
  onCancel,
  onSave,
}: {
  session: PrepSession
  error?: string | null
  busy?: boolean
  onCancel: () => void
  onSave: (next: { date: string; slot: Slot; reportingTime: string }) => void | Promise<void>
}) {
  const { t } = useLang()
  const hospital = session.hospitalShort
  const [date, setDate] = useState(session.date)
  const [slot, setSlot] = useState<Slot>(session.slot)
  const [reportingTime, setReportingTime] = useState(session.reportingTime)

  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col bg-paper"
      {...fadeY}
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-5">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={busy ? 'build' : 'form'}
            {...fadeY}
          >
            {busy ? (
              <GeneratingPane
                title={t('app.regenerating')}
                hint={t('app.regeneratingHint', { hospital })}
              />
            ) : (
              <>
                <p className="text-[13px] font-semibold text-muted">
                  {t('app.stayingAt', { hospital })}
                </p>
                <div className="mt-4">
                  <DateSlotPicker
                    date={date}
                    slot={slot}
                    reportingTime={reportingTime}
                    dateLabel={t('app.dateTitle')}
                    onChange={(next) => {
                      if (next.date) setDate(next.date)
                      if (next.slot) setSlot(next.slot)
                      if (next.reportingTime) setReportingTime(next.reportingTime)
                    }}
                  />
                </div>
                {error ? (
                  <p className="mt-3 text-[13px] leading-relaxed text-no" role="alert">
                    {error}
                  </p>
                ) : null}
                <div className="mt-5 grid gap-2">
                  <PrimaryButton
                    disabled={busy}
                    onClick={() => void onSave({ date, slot, reportingTime })}
                  >
                    {t('app.saveDate')}
                  </PrimaryButton>
                  <button
                    type="button"
                    onClick={onCancel}
                    className="min-h-[48px] w-full rounded-full bg-white px-4 text-[17px] font-semibold text-ink"
                  >
                    {t('on.back')}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
