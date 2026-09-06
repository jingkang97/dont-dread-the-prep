import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Camera } from 'lucide-react'
import { HOSPITALS } from '../data/hospitals'
import { protocolCopy, type OnboardingResult } from '../data/onboarding'
import { DateSlotPicker } from '../components/DateSlotPicker'
import { HospitalPicker } from '../components/HospitalPicker'
import { Card, GeneratingPane, GhostButton, PrimaryButton, SectionLabel } from '../components/ui'
import { useLang } from '../i18n/LanguageContext'
import { hospCopyKey } from '../i18n/keys'
import { cn } from '../lib/cn'
import { formatHm, formatYmd } from '../lib/dates'
import { ApiError } from '../lib/api'
import { easeOut, fadeY } from '../lib/motion'
import { useApiHospitals } from '../hooks/useApiHospitals'
import { useOnboardingDraft } from '../hooks/useOnboardingDraft'
import yellowForm from '../assets/sgh-yellow-form.jpg'

export function Onboarding({
  onComplete,
}: {
  onComplete: (d: OnboardingResult) => void | Promise<unknown>
}) {
  const { t, lang } = useLang()
  const { apiHospitals, selectableIds, hospitalsError } = useApiHospitals()
  const {
    step,
    setStep,
    scanPhase,
    draft,
    setDraft,
    demoDate,
    pickHospital,
    runScan,
    leaveScan,
  } = useOnboardingDraft()

  const hospital = draft.hospitalId ? HOSPITALS[draft.hospitalId] : null
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const apiHospital = useMemo(
    () => apiHospitals.find((h) => h.code === draft.hospitalId) ?? null,
    [apiHospitals, draft.hospitalId],
  )
  const protocols = apiHospital?.protocols ?? []
  const needsProtocolChoice = protocols.length > 1
  const selectedProtocol = protocols.find((p) => p.name === draft.protocolName) ?? null
  const canFinish = Boolean(
    draft.hospitalId &&
      draft.date &&
      draft.slot &&
      (!needsProtocolChoice || draft.protocolName),
  )

  async function generate() {
    if (!canFinish || !draft.hospitalId || !draft.slot || busy) return
    setBusy(true)
    setError(null)
    try {
      await onComplete({
        hospitalId: draft.hospitalId,
        date: draft.date,
        slot: draft.slot,
        reportingTime: draft.reportingTime,
        firstName: draft.firstName,
        protocolName: draft.protocolName ?? undefined,
      })
    } catch (err) {
      setBusy(false)
      setError(
        err instanceof ApiError
          ? err.detail
          : 'Could not start session. Is the API running on port 8000?',
      )
    }
  }

  const prepDisplay = (() => {
    if (!selectedProtocol) {
      return hospital ? t(hospCopyKey(hospital.id, 'prep')) : ''
    }
    const copy = protocolCopy(selectedProtocol.name)
    return copy ? t(copy.label) : selectedProtocol.prep_agent_label
  })()

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="shrink-0 px-5 pb-4 pt-8">
        <p className="text-[13px] font-semibold text-teal-deep">{t('on.kicker')}</p>
        <h1 className="font-display mt-1 text-[34px] leading-[1.1] tracking-tight text-ink">{t('on.title')}</h1>
        <p className="mt-3 text-[15px] leading-snug text-ink-soft">{t('on.lead')}</p>
      </header>

      <div className="relative min-h-0 flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={busy ? 'build' : step}
            className="absolute inset-0 overflow-y-auto overscroll-y-contain overflow-anchor-none px-5 pb-8"
            {...fadeY}
          >
            {busy ? (
              <GeneratingPane
                title={t('on.generating')}
                hint={t('on.generatingHint', { hospital: hospital?.short ?? '' })}
              />
            ) : (
              <>
        {step === 'hospital' && (
          <div>
            {hospitalsError ? (
              <p className="mt-3 text-[13px] leading-relaxed text-no" role="alert">
                {hospitalsError}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => runScan(apiHospitals)}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-dashed border-teal/40 bg-cream px-4 py-3.5 text-[14px] font-semibold text-teal-deep"
            >
              <Camera size={18} />
              {t('on.scanCta')}
            </button>
            <p className="mt-2 text-center text-[11px] text-muted">{t('on.scanNote')}</p>
            <div className="mt-5">
              <SectionLabel>{t('on.step1')}</SectionLabel>
              <HospitalPicker
                selected={draft.hospitalId}
                selectableIds={selectableIds}
                onPick={(id) => {
                  setError(null)
                  pickHospital(id, apiHospitals)
                }}
              />
            </div>
          </div>
        )}

        {step === 'schedule' && (
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
            {needsProtocolChoice && (
              <div className="mt-5">
                <p className="text-[13px] font-semibold text-navy">{t('on.protocol')}</p>
                <p className="mt-1 text-[12px] leading-snug text-muted">{t('on.protocolHint')}</p>
                <div className="mt-2.5 grid gap-2.5">
                  {protocols.map((protocol) => {
                    const selected = draft.protocolName === protocol.name
                    const copy = protocolCopy(protocol.name)
                    return (
                      <button
                        key={protocol.name}
                        type="button"
                        onClick={() =>
                          setDraft((d) => ({ ...d, protocolName: protocol.name }))
                        }
                        className={cn(
                          'rounded-[20px] bg-paper-2 px-4 py-3.5 text-left transition',
                          selected ? 'ring-2 ring-teal/40' : '',
                        )}
                      >
                        <span className="block text-[15px] font-semibold text-ink">
                          {copy ? t(copy.label) : protocol.prep_agent_label}
                        </span>
                        <span className="mt-0.5 block text-[12px] text-muted">
                          {copy ? t(copy.hint) : protocol.last_meal}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
            <div className="mt-5 grid gap-2">
              <PrimaryButton
                disabled={!draft.slot || (needsProtocolChoice && !draft.protocolName)}
                onClick={() => setStep('confirm')}
              >
                {t('on.continue')}
              </PrimaryButton>
              <GhostButton onClick={() => setStep('hospital')}>{t('on.back')}</GhostButton>
            </div>
          </div>
        )}

        {step === 'confirm' && hospital && draft.slot && (
          <div>
            <SectionLabel>{t('on.step3')}</SectionLabel>
            <Card className="mt-3 overflow-hidden">
              <div className="bg-cream px-4 py-3">
                <p className="text-[12px] font-semibold text-teal-deep">{t('on.formTitle')}</p>
                <p className="font-display text-[22px] tracking-tight text-ink">{hospital.short}</p>
              </div>
              <dl className="divide-y divide-line px-4">
                <Row k={t('on.hospital')} v={t(hospCopyKey(hospital.id, 'name'))} />
                <Row k={t('on.prep')} v={prepDisplay} />
                <Row k={t('on.scopeDate')} v={formatYmd(draft.date, lang)} />
                <Row k={t('on.sessionLabel')} v={draft.slot === 'am' ? t('on.morning') : t('on.afternoon')} />
                <Row k={t('on.reportBy')} v={formatHm(draft.reportingTime)} />
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
            {error ? (
              <p className="mt-3 text-[13px] leading-relaxed text-no" role="alert">
                {error}
              </p>
            ) : null}
            <div className="mt-5 grid gap-2">
              <PrimaryButton disabled={!canFinish || busy} onClick={() => void generate()}>
                {t('on.generate')}
              </PrimaryButton>
              <GhostButton onClick={() => setStep('schedule')}>{t('on.back')}</GhostButton>
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
                <PrimaryButton onClick={() => setStep('confirm')}>{t('on.useDetails')}</PrimaryButton>
                <GhostButton onClick={() => runScan(apiHospitals)}>{t('on.scanAgain')}</GhostButton>
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
