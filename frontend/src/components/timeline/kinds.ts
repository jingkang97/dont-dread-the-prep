import type { StringKey } from '../../i18n/strings'
import type { EventKind } from '../../lib/timeline'

export const KIND_TONE: Record<EventKind, string> = {
  diet: 'bg-teal/15 text-teal-deep',
  med: 'bg-ask-bg text-ask',
  dose: 'bg-[#e8f8ff] text-[#007aff]',
  meal: 'bg-yes-bg text-yes',
  fast: 'bg-no-bg text-no',
  arrive: 'bg-cream text-teal-deep',
  check: 'bg-ask-bg text-ask',
  gap: 'bg-ask-bg text-ask',
}

export const KIND_KEY: Record<EventKind, StringKey> = {
  diet: 'kind.diet',
  med: 'kind.med',
  dose: 'kind.dose',
  meal: 'kind.meal',
  fast: 'kind.fast',
  arrive: 'kind.arrive',
  check: 'kind.check',
  gap: 'kind.gap',
}
