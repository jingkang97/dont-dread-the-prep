import type { HospitalId, Slot } from './hospitals'

/**
 * Onboarding wizard types (steps, draft).
 * Protocol names and copy live in `lib/api/onboarding`.
 * Hospital *catalog* UI lives in `hospitalPicker.ts`; hospital *identity*
 * and MVP session gate live in `hospitals.ts` (`MVP_HOSPITAL_IDS`).
 */

/** Wizard steps in Onboarding.tsx */
export type OnboardingStep = 'hospital' | 'schedule' | 'confirm' | 'scan'

export type ScanPhase = 'live' | 'done'

export type OnboardingDraft = {
  hospitalId: HospitalId | null
  protocolName: string | null
  date: string
  slot: Slot | null
  reportingTime: string
  firstName: string
}

/** Payload handed to App → createSession */
export type OnboardingResult = {
  hospitalId: HospitalId
  date: string
  slot: Slot
  reportingTime: string
  firstName: string
  protocolName?: string
}
