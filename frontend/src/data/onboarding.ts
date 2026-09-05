import type { HospitalId, Slot } from './hospitals'
import type { StringKey } from '../i18n/strings'

/**
 * Onboarding wizard types (steps, draft, protocols).
 * Hospital *catalog* UI lives in `hospitalPicker.ts`; hospital *identity*
 * and MVP session gate live in `hospitals.ts` (`MVP_HOSPITAL_IDS`).
 */

/** Wizard steps in Onboarding.tsx */
export type OnboardingStep = 'hospital' | 'schedule' | 'confirm' | 'scan'

export type ScanPhase = 'live' | 'done'

/**
 * Protocol *names* from `mvp.seed.sql` (DB `protocols.name`).
 * Not the same as `Hospital.protocol` in `hospitals.ts` (`sgh-nccs` | `ttsh` | …),
 * which is a legacy frontend ruleset key.
 */
export type KnownProtocolName =
  | 'sgh-nccs-picoprep'
  | 'ttsh-picoprep'
  | 'ttsh-picoprep-peg'

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

export const PROTOCOL_COPY: Partial<
  Record<KnownProtocolName, { label: StringKey; hint: StringKey }>
> = {
  'ttsh-picoprep': {
    label: 'on.protocol.ttsh-picoprep',
    hint: 'on.protocol.ttsh-picoprepHint',
  },
  'ttsh-picoprep-peg': {
    label: 'on.protocol.ttsh-picoprep-peg',
    hint: 'on.protocol.ttsh-picoprep-pegHint',
  },
}

const DEFAULT_MULTI_PROTOCOL: Partial<Record<HospitalId, KnownProtocolName>> = {
  ttsh: 'ttsh-picoprep',
}

export function isKnownProtocolName(name: string): name is KnownProtocolName {
  return (
    name === 'sgh-nccs-picoprep' ||
    name === 'ttsh-picoprep' ||
    name === 'ttsh-picoprep-peg'
  )
}

export function protocolCopy(name: string) {
  if (!isKnownProtocolName(name)) return null
  return PROTOCOL_COPY[name] ?? null
}

/** Pick the sole protocol, or TTSH Picoprep-only when several are offered. */
export function defaultProtocolName(
  protocols: { name: string }[],
  hospitalId?: HospitalId | null,
): string | null {
  if (protocols.length === 0) return null
  if (protocols.length === 1) return protocols[0].name
  const preferred =
    (hospitalId && DEFAULT_MULTI_PROTOCOL[hospitalId]) || 'ttsh-picoprep'
  return protocols.find((p) => p.name === preferred)?.name ?? protocols[0].name
}
