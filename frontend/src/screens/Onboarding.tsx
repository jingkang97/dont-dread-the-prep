import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { format } from 'date-fns'
import { Camera, ChevronRight, Hospital } from 'lucide-react'
import { HOSPITAL_LIST, type HospitalId, type Slot } from '../data/hospitals'
import { DateSlotPicker } from '../components/DateSlotPicker'
import { Card, GeneratingPane, GhostButton, PrimaryButton, SectionLabel } from '../components/ui'
import { useLang } from '../i18n/LanguageContext'
import type { Lang, StringKey } from '../i18n/strings'
import { cn } from '../lib/cn'
import { DATE_LOCALES } from '../lib/dateLocale'
import { defaultReporting } from '../lib/timeline'
import { easeOut } from '../lib/motion'
import yellowForm from '../assets/sgh-yellow-form.jpg'

type Draft = {
  hospitalId: HospitalId | null
  date: string
  slot: Slot | null
  reportingTime: string
  firstName: string
}

function prettyTime(hm: string) {
  const [h, m] = hm.split(':').map(Number)
  return format(new Date(2000, 0, 1, h, m), 'h:mm a')
}

function prettyDate(ymd: string, lang: Lang) {
  const [y, m, d] = ymd.split('-').map(Number)
  return format(new Date(y, m - 1, d), 'EEE d MMM yyyy', { locale: DATE_LOCALES[lang] })
}

function plusDays(n: number) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function Onboarding({
  onComplete,
}: {
  onComplete: (d: {
    hospitalId: HospitalId
    date: string
    slot: Slot
    reportingTime: string
    firstName: string
  }) => void
}) {
  const { t, lang } = useLang()
  const [step, setStep] = useState<1 | 2 | 3 | 'scan'>(1)
  const [scanPhase, setScanPhase] = useState<'live' | 'done'>('live')
  const [draft, setDraft] = useState<Draft>({
    hospitalId: null,
    date: plusDays(7),
    slot: 'am',
    reportingTime: defaultReporting('am'),
    firstName: '',
  })

  const hospital = HOSPITAL_LIST.find((h) => h.id === draft.hospitalId)
  const canFinish = Boolean(draft.hospitalId && draft.date && draft.slot)
  const [busy, setBusy] = useState(false)
  const demoDate = useMemo(() => plusDays(4), [])
  const scanTimer = useRef<number | null>(null)

  function runScan() {
    if (scanTimer.current) window.clearTimeout(scanTimer.current)
    setStep('scan')
    setScanPhase('live')
    scanTimer.current = window.setTimeout(() => {
      setDraft({
        hospitalId: 'sgh',
        date: demoDate,
        slot: 'am',
        reportingTime: '08:00',
        firstName: '',
      })
      setScanPhase('done')
      scanTimer.current = null
    }, 2200)
  }

  function leaveScan() {
    if (scanTimer.current) window.clearTimeout(scanTimer.current)
    scanTimer.current = null
    setScanPhase('live')
    setStep(1)
  }

  function generate() {
    if (!canFinish || !draft.hospitalId || !draft.slot || busy) return
    setBusy(true)
    window.setTimeout(() => {
      onComplete({
        hospitalId: draft.hospitalId!,
        date: draft.date,
        slot: draft.slot!,
        reportingTime: draft.reportingTime,
        firstName: draft.firstName,
      })
    }, 1200)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="shrink-0 px-5 pb-4 pt-8">
        <p className="text-[13px] font-semibold text-teal-deep">{t('on.kicker')}</p>
        <h1 className="font-display mt-1 text-[34px] leading-[1.1] tracking-tight text-ink">{t('on.title')}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{t('on.lead')}</p>
      </header>

      <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 pb-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={busy ? 'build' : String(step)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: easeOut }}
          >
            {busy ? (
              <GeneratingPane
                title={t('on.generating')}
                hint={t('on.generatingHint', { hospital: hospital?.short ?? '' })}
              />
            ) : (
              <>
        {step === 1 && (
          <div>
            <SectionLabel>{t('on.step1')}</SectionLabel>
            <div className="mt-3 grid gap-2.5">
              {HOSPITAL_LIST.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => {
                    setDraft((d) => ({ ...d, hospitalId: h.id }))
                    setStep(2)
                  }}
                  className={cn(
                    'flex items-center gap-3 rounded-[20px] bg-paper-2 px-4 py-3.5 text-left transition',
                    draft.hospitalId === h.id ? 'ring-2 ring-teal/40' : '',
                  )}
                >
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                    style={{ background: h.accent }}
                  >
                    <Hospital size={18} />
                  </span>
                  <span className="flex-1">
                    <span className="block text-[15px] font-semibold text-ink">{h.short}</span>
                    <span className="block text-[12px] text-muted">
                      {t(`hosp.${h.id}.name` as StringKey)} · {t(`hosp.${h.id}.prep` as StringKey)}
                    </span>
                  </span>
                  <ChevronRight size={18} className="text-muted" />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={runScan}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-dashed border-teal/40 bg-cream px-4 py-3.5 text-[14px] font-semibold text-teal-deep"
            >
              <Camera size={18} />
              {t('on.scanCta')}
            </button>
            <p className="mt-2 text-center text-[11px] text-muted">{t('on.scanNote')}</p>
          </div>
        )}

        {step === 2 && (
          <div>
            <SectionLabel>{t('on.step2')}</SectionLabel>
            <div className="mt-3">
              <DateSlotPicker
                date={draft.date}
                slot={draft.slot}
                reportingTime={draft.reportingTime}
                onChange={(next) => setDraft((d) => ({ ...d, ...next }))}
              />
            </div>
            <div className="mt-5 grid gap-2">
              <PrimaryButton disabled={!draft.slot} onClick={() => setStep(3)}>
                {t('on.continue')}
              </PrimaryButton>
              <GhostButton onClick={() => setStep(1)}>{t('on.back')}</GhostButton>
            </div>
          </div>
        )}

        {step === 3 && hospital && draft.slot && (
          <div>
            <SectionLabel>{t('on.step3')}</SectionLabel>
            <Card className="mt-3 overflow-hidden">
              <div className="bg-cream px-4 py-3">
                <p className="text-[12px] font-semibold text-teal-deep">{t('on.formTitle')}</p>
                <p className="font-display text-[22px] tracking-tight text-ink">{hospital.short}</p>
              </div>
              <dl className="divide-y divide-line px-4">
                <Row k={t('on.hospital')} v={t(`hosp.${hospital.id}.name` as StringKey)} />
                <Row k={t('on.prep')} v={t(`hosp.${hospital.id}.prep` as StringKey)} />
                <Row k={t('on.scopeDate')} v={prettyDate(draft.date, lang)} />
                <Row k={t('on.sessionLabel')} v={draft.slot === 'am' ? t('on.morning') : t('on.afternoon')} />
                <Row k={t('on.reportBy')} v={prettyTime(draft.reportingTime)} />
              </dl>
            </Card>
            <label className="mt-4 block text-[13px] font-semibold text-navy" htmlFor="firstName">
              {t('on.name')}
            </label>
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              enterKeyHint="done"
              maxLength={24}
              placeholder={t('on.namePlaceholder')}
              value={draft.firstName}
              onChange={(e) => setDraft((d) => ({ ...d, firstName: e.target.value }))}
              className="mt-1.5 w-full rounded-xl border border-transparent bg-paper-2 px-3 py-3 text-[16px] text-ink"
            />
            <p className="mt-1.5 text-[12px] text-muted">{t('on.nameHint')}</p>
            <p className="mt-3 text-[12px] leading-relaxed text-muted">
              {t('on.confirmNote', { hospital: hospital.short })}
            </p>
            <div className="mt-5 grid gap-2">
              <PrimaryButton disabled={!canFinish || busy} onClick={generate}>
                {t('on.generate')}
              </PrimaryButton>
              <GhostButton onClick={() => setStep(2)}>{t('on.back')}</GhostButton>
            </div>
          </div>
        )}

        {step === 'scan' && (
          <div>
            <SectionLabel>{t('on.scanLabel')}</SectionLabel>
            <div className="relative mt-3 overflow-hidden rounded-[22px] bg-black">
              <img
                src={yellowForm}
                alt="SGH and NCCS Dietary Advice and PICOPREP bowel preparation form"
                className={cn(
                  'block h-[420px] w-full object-cover object-top transition duration-500',
                  scanPhase === 'live' ? 'scale-[1.04] opacity-90' : 'scale-100 opacity-100',
                )}
              />
              {scanPhase === 'live' && (
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute inset-4 rounded-[16px] border border-white/70" />
                  <div className="absolute inset-x-0 h-10 bg-gradient-to-b from-teal/50 to-transparent scan-line" />
                </div>
              )}
              {scanPhase === 'done' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25, ease: easeOut }}
                  className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-10"
                >
                  <p className="text-[12px] font-semibold text-teal">SGH / NCCS</p>
                  <p className="text-[15px] font-semibold text-white">
                    {t('on.scopeDate')} {demoDate} · {t('on.morning')} 08:00
                  </p>
                </motion.div>
              )}
            </div>
            <p className="mt-3 text-[13px] text-ink-soft">
              {scanPhase === 'live' ? t('on.scanning') : t('on.scanDone')}
            </p>
            {scanPhase === 'live' ? (
              <div className="mt-4">
                <GhostButton onClick={leaveScan}>{t('on.cancel')}</GhostButton>
              </div>
            ) : (
              <div className="mt-4 grid gap-2">
                <PrimaryButton onClick={() => setStep(3)}>{t('on.useDetails')}</PrimaryButton>
                <GhostButton onClick={runScan}>{t('on.scanAgain')}</GhostButton>
                <GhostButton onClick={leaveScan}>{t('on.back')}</GhostButton>
              </div>
            )}
          </div>
        )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2.5 text-[14px]">
      <dt className="text-muted">{k}</dt>
      <dd className="text-right font-semibold text-ink">{v}</dd>
    </div>
  )
}
