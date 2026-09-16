import type { ComponentType } from 'react'
import type { TimelineEvent } from '../../lib/timeline'
import { FleetMixSheet } from './FleetMixSheet'
import { PegMixSheet } from './PegMixSheet'
import { PicoprepMixSheet } from './PicoprepMixSheet'

export type MixKind = 'peg' | 'picoprep' | 'fleet'

type MixSheetProps = {
  onClose: () => void
  prepImageLabel?: string | null
}

type MixHelp = {
  hint: string
  Sheet: ComponentType<MixSheetProps>
}

/** Prep help sheets keyed by protocol_steps.agent. Hints stay English (clinical copy). */
export const MIX_HELP: Record<MixKind, MixHelp> = {
  peg: {
    hint: 'How to mix PEG',
    Sheet: PegMixSheet,
  },
  picoprep: {
    hint: 'How to mix Picoprep',
    Sheet: PicoprepMixSheet,
  },
  fleet: {
    hint: 'Enema positions',
    Sheet: FleetMixSheet,
  },
}

export function mixHelpFor(event: TimelineEvent): (MixHelp & { kind: MixKind }) | null {
  if (event.kind !== 'prep' || !event.agent) return null
  if (event.agent === 'peg') {
    return event.prepImageLabel ? { kind: 'peg', ...MIX_HELP.peg } : null
  }
  if (event.agent === 'picoprep') return { kind: 'picoprep', ...MIX_HELP.picoprep }
  if (event.agent === 'fleet') return { kind: 'fleet', ...MIX_HELP.fleet }
  return null
}
