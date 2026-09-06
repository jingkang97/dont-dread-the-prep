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
  | 'ttsh-picoprep-peg'

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

const DEFAULT_MULTI_PROTOCOL: Record<string, KnownProtocolName> = {
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
  protocols: Pick<ApiProtocolSummary, 'name'>[],
  hospitalCode?: string | null,
): string | null {
  if (protocols.length === 0) return null
  if (protocols.length === 1) return protocols[0].name
  const preferred =
    (hospitalCode && DEFAULT_MULTI_PROTOCOL[hospitalCode]) || 'ttsh-picoprep'
  return protocols.find((p) => p.name === preferred)?.name ?? protocols[0].name
}
