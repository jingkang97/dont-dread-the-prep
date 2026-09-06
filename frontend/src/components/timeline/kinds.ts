import type { StringKey } from '../../i18n/strings'
import type { EventKind } from '../../lib/timeline'

export const KIND_TONE: Record<EventKind, string> = {
  diet: 'bg-[#eef0ff] text-[#5856d6]',
  dose: 'bg-[#e8f8ff] text-[#007aff]',
  meal: 'bg-[#fff6e0] text-[#9a6700]',
  fast: 'bg-no-bg text-no',
  arrive: 'bg-yes-bg text-yes',
  stool: 'bg-ask-bg text-ask',
}

export const KIND_KEY: Record<EventKind, StringKey> = {
  diet: 'kind.diet',
  dose: 'kind.dose',
  meal: 'kind.meal',
  fast: 'kind.fast',
  arrive: 'kind.arrive',
  stool: 'kind.stool',
}
