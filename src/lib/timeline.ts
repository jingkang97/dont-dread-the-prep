import { HOSPITALS, type Hospital, type HospitalId, type Slot } from '../data/hospitals'
import type { StringKey } from '../i18n/strings'

export type EventKind = 'diet' | 'med' | 'dose' | 'meal' | 'fast' | 'arrive' | 'check' | 'gap'

export type TimelineEvent = {
  id: string
  at: Date
  titleKey: StringKey
  titleVars?: Record<string, string>
  detailKey?: StringKey
  detailVars?: Record<string, string>
  fluidKey?: StringKey
  /** Hospital source line — stays in English. */
  citedDetail?: string
  kind: EventKind
  source: string
  tentative?: boolean
}

export type SessionInput = {
  hospitalId: HospitalId
  date: string
  slot: Slot
  reportingTime: string
}

type Translate = (key: StringKey, vars?: Record<string, string>) => string

export function resolveEventText(event: TimelineEvent, t: Translate) {
  const detailVars = {
    ...event.detailVars,
    ...(event.fluidKey ? { fluid: t(event.fluidKey) } : {}),
  }
  return {
    title: t(event.titleKey, event.titleVars),
    detail: event.citedDetail ?? (event.detailKey ? t(event.detailKey, detailVars) : ''),
  }
}

function atDate(dateStr: string, dayOffset: number, hm: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const [hh, mm] = hm.split(':').map(Number)
  return new Date(y, m - 1, d + dayOffset, hh, mm, 0, 0)
}

function subHours(date: Date, hours: number) {
  return new Date(date.getTime() - hours * 60 * 60 * 1000)
}

function stoolActionKey(id: HospitalId): StringKey {
  return `hosp.${id}.stoolAction` as StringKey
}

export function defaultReporting(slot: Slot) {
  return slot === 'am' ? '08:00' : '13:30'
}

export function buildTimeline(input: SessionInput): TimelineEvent[] {
  const hospital = HOSPITALS[input.hospitalId]
  const report = atDate(input.date, 0, input.reportingTime)
  const events: TimelineEvent[] = []

  if (hospital.protocol === 'ttsh') {
    events.push({
      id: 'med-7',
      at: atDate(input.date, -7, '09:00'),
      titleKey: 'ev.med7',
      detailKey: 'ev.med7Body',
      kind: 'med',
      source: 'TTSH brochure March 2026',
    })
    events.push({
      id: 'med-sglt2',
      at: atDate(input.date, -2, '09:00'),
      titleKey: 'ev.sglt2',
      detailKey: 'ev.sglt2Body',
      kind: 'med',
      source: 'TTSH brochure March 2026',
    })
  }

  if (hospital.protocol === 'sgh-nccs') {
    events.push({
      id: 'med-5',
      at: atDate(input.date, -5, '09:00'),
      titleKey: 'ev.med5',
      detailKey: 'ev.med5Body',
      kind: 'med',
      source: 'SGH/NCCS handwritten medication annex · F1 / F3',
    })
    events.push({
      id: 'med-sglt2-gap',
      at: atDate(input.date, -2, '09:00'),
      titleKey: 'ev.sglt2Gap',
      detailKey: 'ev.sglt2GapBody',
      kind: 'gap',
      source: 'F2 · SGH yellow form (silent)',
    })
  }

  events.push({
    id: 'diet-start',
    at: atDate(input.date, -hospital.dietDays, '00:00'),
    titleKey: 'ev.dietStart',
    titleVars: { days: String(hospital.dietDays) },
    detailKey: 'ev.dietStartBody',
    detailVars: { hospital: hospital.short, days: String(hospital.dietDays) },
    kind: 'diet',
    source: `${hospital.short} prep sheet · diet duration`,
  })

  pushPrepEvents(events, hospital, input, report)

  events.push({
    id: 'fast',
    at: subHours(report, hospital.fluidStopHours),
    titleKey: 'ev.stopFluids',
    titleVars: { hours: String(hospital.fluidStopHours) },
    detailKey: hospital.protocol === 'skh' ? 'ev.stopFluidsSkh' : 'ev.stopFluidsSgh',
    kind: 'fast',
    source:
      hospital.protocol === 'skh'
        ? 'SKH bowel preparation generator'
        : 'SGH/NCCS yellow form — stop drinking / 2 hours',
  })

  events.push({
    id: 'arrive',
    at: report,
    titleKey: 'ev.report',
    titleVars: { hospital: hospital.short },
    detailKey: 'ev.reportBody',
    detailVars: { time: input.reportingTime },
    kind: 'arrive',
    source: 'Appointment details you entered',
  })

  events.sort((a, b) => a.at.getTime() - b.at.getTime())
  return events
}

function pushPrepEvents(
  events: TimelineEvent[],
  hospital: Hospital,
  input: SessionInput,
  report: Date,
) {
  const eveDinnerTime = hospital.protocol === 'ttsh' ? '18:30' : hospital.protocol === 'skh' ? '18:00' : '19:00'

  events.push({
    id: 'last-meal-eve',
    at: atDate(input.date, -1, eveDinnerTime),
    titleKey: 'ev.lastMeal',
    citedDetail: hospital.lastMeal,
    kind: 'meal',
    source: hospital.lastMealNote,
  })

  if (hospital.prepAgent === 'picoprep-4') {
    events.push({
      id: 'p1',
      at: atDate(input.date, -1, '18:00'),
      titleKey: 'ev.packet',
      titleVars: { n: '1' },
      detailKey: 'ev.mix',
      detailVars: { n: '1' },
      fluidKey: 'ev.fluid1L',
      kind: 'dose',
      source: 'SGH/NCCS yellow form — mix 1 packet with 150ml water, follow with 1L clear fluid',
    })
    events.push({
      id: 'p2',
      at: atDate(input.date, -1, '21:00'),
      titleKey: 'ev.packet',
      titleVars: { n: '2' },
      detailKey: 'ev.mix',
      detailVars: { n: '2' },
      fluidKey: 'ev.fluid1L',
      kind: 'dose',
      source: 'SGH/NCCS yellow form — packets 1 and 2 on the eve of scope (times are handwritten blanks)',
    })

    if (input.slot === 'am') {
      events.push({
        id: 'p3',
        at: atDate(input.date, 0, '04:30'),
        titleKey: 'ev.packetBefore6',
        titleVars: { n: '3' },
        detailKey: 'ev.mix',
        detailVars: { n: '3' },
        fluidKey: 'ev.fluid1L',
        kind: 'dose',
        source: 'SGH/NCCS yellow form — packets 3 and 4 on the morning of scope, before 6am',
      })
      events.push({
        id: 'p4',
        at: atDate(input.date, 0, '05:30'),
        titleKey: 'ev.packetBefore6',
        titleVars: { n: '4' },
        detailKey: 'ev.mix',
        detailVars: { n: '4' },
        fluidKey: 'ev.fluid1L',
        kind: 'dose',
        source: 'SGH/NCCS yellow form — packets 3 and 4 before 6am',
      })
      events.push({
        id: 'breakfast-am',
        at: atDate(input.date, 0, '06:00'),
        titleKey: 'ev.breakfastAm',
        detailKey: 'ev.breakfastAmBody',
        kind: 'meal',
        source: 'SGH/NCCS yellow form — day of scope, morning',
      })
    } else {
      events.push({
        id: 'breakfast-pm',
        at: atDate(input.date, 0, '07:00'),
        titleKey: 'ev.breakfastPm',
        detailKey: 'ev.breakfastPmBody',
        kind: 'meal',
        source: 'SGH/NCCS yellow form — day of; F10 afternoon gap',
        tentative: true,
      })
      events.push({
        id: 'p3-pm',
        at: atDate(input.date, 0, '08:00'),
        titleKey: 'ev.packetHand',
        titleVars: { n: '3' },
        detailKey: 'ev.p3pmBody',
        kind: 'gap',
        source: 'F10 · ESGE/USMSTF split-dose window (not printed on SGH form)',
        tentative: true,
      })
      const p4 = subHours(report, 5)
      events.push({
        id: 'p4-pm',
        at: p4,
        titleKey: 'ev.packetHand',
        titleVars: { n: '4' },
        detailKey: 'ev.p4pmBody',
        kind: 'gap',
        source: 'F10 · last-dose 2–5h window (ESGE / KSGE) — not on SGH form',
        tentative: true,
      })
    }
  }

  if (hospital.prepAgent === 'picoprep-2' && hospital.protocol === 'skh') {
    if (input.slot === 'am') {
      events.push({
        id: 'skh-p1',
        at: atDate(input.date, -1, '18:00'),
        titleKey: 'ev.packet',
        titleVars: { n: '1' },
        detailKey: 'ev.skhP1',
        kind: 'dose',
        source: 'SKH bowel preparation generator — Picoprep, morning session',
      })
      events.push({
        id: 'skh-p2',
        at: atDate(input.date, -1, '22:30'),
        titleKey: 'ev.packet',
        titleVars: { n: '2' },
        detailKey: 'ev.skhP2',
        kind: 'dose',
        source: 'SKH bowel preparation generator — Picoprep, morning session',
      })
    } else {
      events.push({
        id: 'skh-p1-pm',
        at: atDate(input.date, 0, '06:00'),
        titleKey: 'ev.packetPm',
        titleVars: { n: '1' },
        detailKey: 'ev.skhP1Pm',
        kind: 'dose',
        source: 'SKH bowel preparation generator — afternoon session pattern',
        tentative: true,
      })
      events.push({
        id: 'skh-p2-pm',
        at: atDate(input.date, 0, '10:30'),
        titleKey: 'ev.packetPm',
        titleVars: { n: '2' },
        detailKey: 'ev.skhP2Pm',
        kind: 'dose',
        source: 'SKH bowel preparation generator — afternoon session pattern',
        tentative: true,
      })
    }
  }

  if (hospital.protocol === 'ttsh') {
    if (input.slot === 'am') {
      events.push({
        id: 'ttsh-p1',
        at: atDate(input.date, -1, '18:00'),
        titleKey: 'ev.ttshEve',
        detailKey: 'ev.ttshEveBody',
        kind: 'dose',
        source: 'TTSH Picoprep 8AM–2PM PDF (slot-specific)',
      })
      events.push({
        id: 'ttsh-p2',
        at: atDate(input.date, 0, '05:00'),
        titleKey: 'ev.ttshAm',
        detailKey: 'ev.ttshAmBody',
        kind: 'dose',
        source: 'TTSH Picoprep 8AM–2PM PDF',
      })
    } else {
      events.push({
        id: 'ttsh-p1-pm',
        at: atDate(input.date, 0, '06:00'),
        titleKey: 'ev.ttshPm1',
        detailKey: 'ev.ttshPm1Body',
        kind: 'dose',
        source: 'TTSH Picoprep 2PM–5PM PDF',
      })
      events.push({
        id: 'ttsh-p2-pm',
        at: subHours(report, 5),
        titleKey: 'ev.ttshPm2',
        detailKey: 'ev.ttshPm2Body',
        kind: 'dose',
        source: 'TTSH Picoprep 2PM–5PM PDF',
        tentative: true,
      })
    }
  }

  if (hospital.protocol === 'cgh') {
    events.push({
      id: 'cgh-peg-eve',
      at: atDate(input.date, -1, '18:00'),
      titleKey: 'ev.cghPegEve',
      detailKey: 'ev.cghPegEveBody',
      kind: 'dose',
      source: 'CGH brochure June 2026 — PEG-ES + simeticone',
      tentative: true,
    })
    events.push({
      id: 'cgh-bfast',
      at: atDate(input.date, 0, '06:00'),
      titleKey: 'ev.cghBfast',
      detailKey: 'ev.cghBfastBody',
      kind: 'meal',
      source: 'CGH brochure June 2026',
    })
    events.push({
      id: 'cgh-peg-am',
      at: atDate(input.date, 0, '06:30'),
      titleKey: 'ev.cghPegAm',
      detailKey: 'ev.cghPegAmBody',
      kind: 'dose',
      source: 'CGH brochure June 2026',
      tentative: true,
    })
  }

  events.push({
    id: 'stool-check',
    at: subHours(report, 3),
    titleKey: 'ev.stoolCheck',
    detailKey: stoolActionKey(hospital.id),
    kind: 'check',
    source:
      hospital.stoolScale === 'ttsh-6'
        ? 'TTSH 6-point scale + action'
        : hospital.stoolScale === 'skh-5'
          ? 'SKH 5-point cup chart'
          : 'Adapted from TTSH 6-point scale — not printed on this hospital’s form',
  })
}

export function remindersFor(report: Date) {
  return [
    { key: 't72' as const, label: 'T−72 hours', at: subHours(report, 72), blurb: 'Low-residue diet should already be underway. Open your timeline.' },
    { key: 't24' as const, label: 'T−24 hours', at: subHours(report, 24), blurb: 'Eve of scope. Last meal and first Picoprep doses are close.' },
    { key: 't6' as const, label: 'T−6 hours', at: subHours(report, 6), blurb: 'Final doses and fasting cutoff. Check stool colour before you leave.' },
  ]
}
