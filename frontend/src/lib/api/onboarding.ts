import type { StringKey } from '../../i18n/strings'
import type { ApiProtocolSummary } from './hospitals'

/**
 * Protocol *names* from `mvp.seed.sql` (DB `protocols.name`).
 * Not the same as `Hospital.protocol` in `hospitals.ts` (`sgh-nccs` | `ttsh` | …),
 * which is a legacy frontend ruleset key.
 */
export type KnownProtocolName =
  | 'sgh-nccs-picoprep'
  | 'ttsh-picoprep'
  | 'ttsh-picoprep (8am-2pm)'
  | 'ttsh-picoprep (2pm-5pm)'
  | 'ttsh-picoprep-peg'
  | 'ttsh-picoprep-peg (8am-2pm)'

export const TTSH_PICOPREP_AM = 'ttsh-picoprep (8am-2pm)'
export const TTSH_PICOPREP_PM = 'ttsh-picoprep (2pm-5pm)'
export const TTSH_PICOPREP_PEG = 'ttsh-picoprep-peg (8am-2pm)'

const PICOPREP_ONLY = new Set<string>([
  'ttsh-picoprep',
  TTSH_PICOPREP_AM,
  TTSH_PICOPREP_PM,
])

const PROTOCOL_NAME_ALIASES: Record<string, KnownProtocolName> = {
  'ttsh-picoprep': TTSH_PICOPREP_AM,
  'ttsh-picoprep-peg': TTSH_PICOPREP_PEG,
}

export const PROTOCOL_COPY: Partial<
  Record<KnownProtocolName, { label: StringKey; hint: StringKey }>
> = {
  'ttsh-picoprep': {
    label: 'on.protocol.ttsh-picoprep',
    hint: 'on.protocol.ttsh-picoprepHint',
  },
  [TTSH_PICOPREP_AM]: {
    label: 'on.protocol.ttsh-picoprep',
    hint: 'on.protocol.ttsh-picoprepHint',
  },
  [TTSH_PICOPREP_PM]: {
    label: 'on.protocol.ttsh-picoprep',
    hint: 'on.protocol.ttsh-picoprepHint',
  },
  'ttsh-picoprep-peg': {
    label: 'on.protocol.ttsh-picoprep-peg',
    hint: 'on.protocol.ttsh-picoprep-pegHint',
  },
  [TTSH_PICOPREP_PEG]: {
    label: 'on.protocol.ttsh-picoprep-peg',
    hint: 'on.protocol.ttsh-picoprep-pegHint',
  },
}

const DEFAULT_MULTI_PROTOCOL: Record<string, KnownProtocolName> = {
  ttsh: TTSH_PICOPREP_AM,
}

export function isKnownProtocolName(name: string): name is KnownProtocolName {
  return name in PROTOCOL_COPY || name === 'sgh-nccs-picoprep'
}

export function protocolCopy(name: string) {
  if (!isKnownProtocolName(name)) return null
  return PROTOCOL_COPY[name] ?? null
}

export function isTtshAfternoonPicoprep(reportingTime: string) {
  return reportingTime >= '14:00'
}

/** One chip per prep agent so 8am–2pm / 2pm–5pm Picoprep is not a third choice. */
export function selectableProtocols<T extends { prep_agent: string }>(protocols: T[]): T[] {
  const seen = new Set<string>()
  const out: T[] = []
  for (const protocol of protocols) {
    if (seen.has(protocol.prep_agent)) continue
    seen.add(protocol.prep_agent)
    out.push(protocol)
  }
  return out
}

export function protocolChoiceSelected(optionName: string, draftName: string | null) {
  if (!draftName) return false
  if (PICOPREP_ONLY.has(optionName) && PICOPREP_ONLY.has(draftName)) return true
  return optionName === draftName
}

/** Pick the sole protocol, or TTSH Picoprep-only when several are offered. */
export function defaultProtocolName(
  protocols: Pick<ApiProtocolSummary, 'name'>[],
  hospitalCode?: string | null,
): string | null {
  if (protocols.length === 0) return null
  if (protocols.length === 1) return protocols[0].name
  const preferred =
    (hospitalCode && DEFAULT_MULTI_PROTOCOL[hospitalCode]) || TTSH_PICOPREP_AM
  return protocols.find((p) => p.name === preferred)?.name ?? protocols[0].name
}

/** Map Picoprep-only to the 8am–2pm or 2pm–5pm sheet from reporting time. */
export function resolveProtocolName(
  protocols: Pick<ApiProtocolSummary, 'name' | 'prep_agent'>[],
  chosenName: string | null | undefined,
  reportingTime: string,
): string | null {
  const aliased = chosenName ? (PROTOCOL_NAME_ALIASES[chosenName] ?? chosenName) : null
  const selected = aliased ? protocols.find((p) => p.name === aliased) : null
  const isPicoprepOnly =
    (selected?.prep_agent === 'picoprep' && PICOPREP_ONLY.has(selected.name)) ||
    (aliased != null && PICOPREP_ONLY.has(aliased))
  if (isPicoprepOnly) {
    const want = isTtshAfternoonPicoprep(reportingTime) ? TTSH_PICOPREP_PM : TTSH_PICOPREP_AM
    return protocols.find((p) => p.name === want)?.name ?? selected?.name ?? aliased
  }
  if (selected) return selected.name
  return aliased ?? defaultProtocolName(protocols)
}
