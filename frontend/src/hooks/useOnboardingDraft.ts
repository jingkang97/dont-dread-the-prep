import { useState } from 'react'
// import { useMemo, useRef } from 'react'
import { type HospitalId } from '../data/hospitals'
import {
  type OnboardingDraft,
  type OnboardingStep,
  // type ScanPhase,
} from '../data/onboarding'
import {
  defaultProtocolName,
  type ApiHospital,
  // type ApiProtocolSummary,
} from '../lib/api'
import { plusDays } from '../lib/dates'
import { defaultReporting } from '../lib/timeline'

export function useOnboardingDraft() {
  const [step, setStep] = useState<OnboardingStep>('hospital')
  // const [scanPhase, setScanPhase] = useState<ScanPhase>('live')
  const [draft, setDraft] = useState<OnboardingDraft>({
    hospitalId: null,
    protocolName: null,
    date: plusDays(7),
    slot: 'am',
    reportingTime: defaultReporting('am'),
    firstName: '',
  })
  // const demoDate = useMemo(() => plusDays(4), [])
  // const scanTimer = useRef<number | null>(null)

  function pickHospital(hospitalId: HospitalId, apiHospitals: ApiHospital[]) {
    const row = apiHospitals.find((h) => h.code === hospitalId)
    setDraft((d) => ({
      ...d,
      hospitalId,
      protocolName: defaultProtocolName(row?.protocols ?? [], hospitalId),
    }))
    setStep('schedule')
  }

  // function runScan(apiHospitals: ApiHospital[]) {
  //   if (scanTimer.current) window.clearTimeout(scanTimer.current)
  //   setStep('scan')
  //   setScanPhase('live')
  //   scanTimer.current = window.setTimeout(() => {
  //     const sgh = apiHospitals.find((h) => h.code === 'sgh')
  //     setDraft({
  //       hospitalId: 'sgh',
  //       protocolName: defaultProtocolName(
  //         sgh?.protocols ?? [{ name: 'sgh-nccs-picoprep' } as ApiProtocolSummary],
  //         'sgh',
  //       ),
  //       date: demoDate,
  //       slot: 'am',
  //       reportingTime: '08:00',
  //       firstName: '',
  //     })
  //     setScanPhase('done')
  //     scanTimer.current = null
  //   }, 2200)
  // }
  //
  // function leaveScan() {
  //   if (scanTimer.current) window.clearTimeout(scanTimer.current)
  //   scanTimer.current = null
  //   setScanPhase('live')
  //   setStep('hospital')
  // }

  return {
    step,
    setStep,
    // scanPhase,
    draft,
    setDraft,
    // demoDate,
    pickHospital,
    // runScan,
    // leaveScan,
  }
}
