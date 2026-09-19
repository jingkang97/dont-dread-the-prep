import type { HospitalId, Slot } from './hospitals'

/**
 * Onboarding wizard types (steps, draft).
 * Protocol names and copy live in `lib/api/onboarding`.
 * Hospital list is loaded from `/api/hospitals`. Accents live in `hospitals.ts`.
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
}

/** Payload handed to App → createSession */
export type OnboardingResult = {
  hospitalId: HospitalId
  date: string
  slot: Slot
  reportingTime: string
  protocolName?: string
}
