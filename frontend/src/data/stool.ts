export type StoolStage = {
  n: number
  name: string
  look: string
  ready: 'not' | 'almost' | 'ready'
  color: string
}

export const STOOL_STAGES: StoolStage[] = [
  { n: 1, name: 'Solid lumps', look: 'Dark, thick, formed stool', ready: 'not', color: '#5c3a24' },
  { n: 2, name: 'Soft blobs', look: 'Brown, thick, still has stool material', ready: 'not', color: '#7a4a28' },
  { n: 3, name: 'Cloudy brown', look: 'Dark brown liquid with particles', ready: 'not', color: '#8a5a2a' },
  { n: 4, name: 'Dark liquid', look: 'Dark orange / brown, semi-clear', ready: 'not', color: '#c47a2b' },
  { n: 5, name: 'Light orange', look: 'Almost clear, light orange', ready: 'almost', color: '#e2a04a' },
  { n: 6, name: 'Clear yellow', look: 'Yellow, light, watery, no particles', ready: 'ready', color: '#e6c35c' },
]
