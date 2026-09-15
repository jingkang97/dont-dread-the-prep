import type { StringKey } from '../../i18n/strings'
import type { EventKind } from '../../lib/timeline'

export const KIND_TONE: Record<EventKind, string> = {
  diet: 'bg-[#eef0ff] text-[#5856d6]',
  prep: 'bg-[#e8f8ff] text-[#007aff]',
  med: 'bg-[#fde8f0] text-[#c2185b]',
  meal: 'bg-[#fff6e0] text-[#9a6700]',
  fast: 'bg-no-bg text-no',
  arrive: 'bg-yes-bg text-yes',
  stool: 'bg-ask-bg text-ask',
}

export const KIND_KEY: Record<EventKind, StringKey> = {
  diet: 'kind.diet',
  prep: 'kind.prep',
  med: 'kind.med',
  meal: 'kind.meal',
  fast: 'kind.fast',
  arrive: 'kind.arrive',
  stool: 'kind.stool',
}
