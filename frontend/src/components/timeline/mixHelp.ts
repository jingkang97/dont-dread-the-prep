import type { ComponentType } from 'react'
import type { TimelineEvent } from '../../lib/timeline'
import { FleetMixSheet } from './FleetMixSheet'
import { Med7dSheet } from './Med7dSheet'
import { PegMixSheet } from './PegMixSheet'
import { PicoprepMixSheet } from './PicoprepMixSheet'

export type HelpKind = 'peg' | 'picoprep' | 'fleet' | 'med-7d'

type HelpSheetProps = {
  onClose: () => void
  prepImageLabel?: string | null
}

type EventHelp = {
  hint: string
  Sheet: ComponentType<HelpSheetProps>
}

/** Timeline ? help sheets. Hints stay English (clinical copy). */
export const EVENT_HELP: Record<HelpKind, EventHelp> = {
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
  'med-7d': {
    hint: 'Medicines to review 7 days before',
    Sheet: Med7dSheet,
  },
}

export function eventHelpFor(event: TimelineEvent): (EventHelp & { kind: HelpKind }) | null {
  if (event.kind === 'med' && event.agent === 'med-7d') {
    return { kind: 'med-7d', ...EVENT_HELP['med-7d'] }
  }
  if (event.kind !== 'prep' || !event.agent) return null
  if (event.agent === 'peg') {
    return event.prepImageLabel ? { kind: 'peg', ...EVENT_HELP.peg } : null
  }
  if (event.agent === 'picoprep') return { kind: 'picoprep', ...EVENT_HELP.picoprep }
  if (event.agent === 'fleet') return { kind: 'fleet', ...EVENT_HELP.fleet }
  return null
}
