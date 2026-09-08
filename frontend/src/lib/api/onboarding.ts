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
  | 'ttsh-picoprep-peg (2pm-5pm)'
  | 'ttsh-peg-2l'
  | 'ttsh-peg-2l (8am-2pm)'
  | 'ttsh-peg-3l'
  | 'ttsh-peg-3l (8am-2pm)'

export const TTSH_PICOPREP_AM = 'ttsh-picoprep (8am-2pm)'
export const TTSH_PICOPREP_PM = 'ttsh-picoprep (2pm-5pm)'
export const TTSH_PICOPREP_PEG_AM = 'ttsh-picoprep-peg (8am-2pm)'
export const TTSH_PICOPREP_PEG_PM = 'ttsh-picoprep-peg (2pm-5pm)'
export const TTSH_PICOPREP_PEG = TTSH_PICOPREP_PEG_AM
export const TTSH_PEG_AM = 'ttsh-peg-2l (8am-2pm)'
export const TTSH_PEG_3L_AM = 'ttsh-peg-3l (8am-2pm)'

const PICOPREP_ONLY = new Set<string>([
  'ttsh-picoprep',
  TTSH_PICOPREP_AM,
  TTSH_PICOPREP_PM,
])

const PICOPREP_PEG = new Set<string>([
  'ttsh-picoprep-peg',
  TTSH_PICOPREP_PEG_AM,
  TTSH_PICOPREP_PEG_PM,
])

const PEG_ONLY = new Set<string>(['ttsh-peg-2l', TTSH_PEG_AM])
const PEG_3L = new Set<string>(['ttsh-peg-3l', TTSH_PEG_3L_AM])

const PROTOCOL_NAME_ALIASES: Record<string, KnownProtocolName> = {
  'ttsh-picoprep': TTSH_PICOPREP_AM,
  'ttsh-picoprep-peg': TTSH_PICOPREP_PEG,
  'ttsh-peg-2l': TTSH_PEG_AM,
  'ttsh-peg': TTSH_PEG_AM,
  'ttsh-peg-3l': TTSH_PEG_3L_AM,
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
  [TTSH_PICOPREP_PEG_PM]: {
    label: 'on.protocol.ttsh-picoprep-peg',
    hint: 'on.protocol.ttsh-picoprep-pegHint',
  },
  'ttsh-peg-2l': {
    label: 'on.protocol.ttsh-peg-2l',
    hint: 'on.protocol.ttsh-peg-2lHint',
  },
  [TTSH_PEG_AM]: {
    label: 'on.protocol.ttsh-peg-2l',
    hint: 'on.protocol.ttsh-peg-2lHint',
  },
  'ttsh-peg-3l': {
    label: 'on.protocol.ttsh-peg-3l',
    hint: 'on.protocol.ttsh-peg-3lHint',
  },
  [TTSH_PEG_3L_AM]: {
    label: 'on.protocol.ttsh-peg-3l',
    hint: 'on.protocol.ttsh-peg-3lHint',
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

/** One chip per prep label so 8am–2pm / 2pm–5pm sheets are not extra choices. */
export function selectableProtocols<T extends { prep_agent: string; prep_agent_label?: string }>(
  protocols: T[],
): T[] {
  const seen = new Set<string>()
  const out: T[] = []
  for (const protocol of protocols) {
    const key = protocol.prep_agent_label || protocol.prep_agent
    if (seen.has(key)) continue
    seen.add(key)
    out.push(protocol)
  }
  return out
}

export function protocolChoiceSelected(optionName: string, draftName: string | null) {
  if (!draftName) return false
  if (PICOPREP_ONLY.has(optionName) && PICOPREP_ONLY.has(draftName)) return true
  if (PICOPREP_PEG.has(optionName) && PICOPREP_PEG.has(draftName)) return true
  if (PEG_ONLY.has(optionName) && PEG_ONLY.has(draftName)) return true
  if (PEG_3L.has(optionName) && PEG_3L.has(draftName)) return true
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

/** Map TTSH Picoprep / Picoprep+PEG to the 8am–2pm or 2pm–5pm sheet from reporting time. */
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
  const isPeg =
    (selected?.prep_agent === 'picoprep-peg' && PICOPREP_PEG.has(selected.name)) ||
    (aliased != null && PICOPREP_PEG.has(aliased))
  if (isPeg) {
    const want = isTtshAfternoonPicoprep(reportingTime)
      ? TTSH_PICOPREP_PEG_PM
      : TTSH_PICOPREP_PEG_AM
    return protocols.find((p) => p.name === want)?.name ?? selected?.name ?? aliased
  }
  const isPegOnly =
    (selected?.prep_agent === 'peg' && PEG_ONLY.has(selected.name)) ||
    (aliased != null && PEG_ONLY.has(aliased))
  if (isPegOnly) {
    return protocols.find((p) => p.name === TTSH_PEG_AM)?.name ?? selected?.name ?? aliased
  }
  const isPeg3l =
    (selected?.prep_agent === 'peg-3l' && PEG_3L.has(selected.name)) ||
    (aliased != null && PEG_3L.has(aliased))
  if (isPeg3l) {
    return protocols.find((p) => p.name === TTSH_PEG_3L_AM)?.name ?? selected?.name ?? aliased
  }
  if (selected) return selected.name
  return aliased ?? defaultProtocolName(protocols)
}
