import { HOSPITALS, type Hospital, type HospitalId, type Slot } from '../data/hospitals'

export type EventKind = 'diet' | 'med' | 'dose' | 'meal' | 'fast' | 'arrive' | 'check' | 'gap'

export type TimelineEvent = {
  id: string
  at: Date
  title: string
  detail: string
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

function atDate(dateStr: string, dayOffset: number, hm: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const [hh, mm] = hm.split(':').map(Number)
  return new Date(y, m - 1, d + dayOffset, hh, mm, 0, 0)
}

function subHours(date: Date, hours: number) {
  return new Date(date.getTime() - hours * 60 * 60 * 1000)
}

function mixPicoprep(n: number, fluid: string) {
  return `Mix packet ${n} with 150ml warm water until dissolved, then ${fluid}. Stay near a toilet — bowel motions usually start within a few hours.`
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
      title: 'If prescribed — iron, Plavix, anti-diarrhoeals',
      detail:
        'TTSH brochure: stop these 7 days before. This is TTSH’s sheet, not SGH’s 5-day annex. Follow the list your counsellor wrote. If you are on these drugs and unsure, ask your care team.',
      kind: 'med',
      source: 'TTSH brochure March 2026',
    })
    events.push({
      id: 'med-sglt2',
      at: atDate(input.date, -2, '09:00'),
      title: 'If prescribed — SGLT2 inhibitors',
      detail:
        'TTSH: stop empagliflozin / dapagliflozin 2 days before. Still confirm against your own list.',
      kind: 'med',
      source: 'TTSH brochure March 2026',
    })
  }

  if (hospital.protocol === 'sgh-nccs') {
    events.push({
      id: 'med-5',
      at: atDate(input.date, -5, '09:00'),
      title: 'If your annex says so — blood thinners',
      detail:
        'The SGH/NCCS stop dates for aspirin, clopidogrel, warfarin and anticoagulants live on a handwritten annex, not the yellow form. Typical annex: 5 days for clopidogrel. TTSH uses 7 days for Plavix — that is variation, not an error. Follow your annex.',
      kind: 'med',
      source: 'SGH/NCCS handwritten medication annex · F1 / F3',
    })
    events.push({
      id: 'med-sglt2-gap',
      at: atDate(input.date, -2, '09:00'),
      title: 'SGLT2 inhibitors — ask your care team',
      detail:
        'TTSH stops these 2 days before. The SGH yellow form is silent. Silent is a gap, not permission to continue or to stop.',
      kind: 'gap',
      source: 'F2 · SGH yellow form (silent)',
    })
  }

  events.push({
    id: 'diet-start',
    at: atDate(input.date, -hospital.dietDays, '00:00'),
    title: `Low-residue diet starts (${hospital.dietDays} days before)`,
    detail: `${hospital.short} prescribes a ${hospital.dietDays}-day low-residue diet. This tool follows your hospital, not the 1-day guideline for low-risk patients. Allowed examples: white rice, white bread, plain noodles, lean protein, tofu, eggs. Not: fruit, vegetables, dairy, wholegrains, fried food, red meat.`,
    kind: 'diet',
    source: `${hospital.short} prep sheet · diet duration`,
  })

  pushPrepEvents(events, hospital, input, report)

  events.push({
    id: 'fast',
    at: subHours(report, hospital.fluidStopHours),
    title: `Stop all fluids (${hospital.fluidStopHours}h before reporting)`,
    detail:
      hospital.protocol === 'skh'
        ? 'SKH: no more water/fluids 4 hours before your reporting time.'
        : 'SGH/NCCS: clear fluids (max 200ml) up to 2 hours before the procedure. Then stop.',
    kind: 'fast',
    source:
      hospital.protocol === 'skh'
        ? 'SKH bowel preparation generator'
        : 'SGH/NCCS yellow form — stop drinking / 2 hours',
  })

  events.push({
    id: 'arrive',
    at: report,
    title: `Report to ${hospital.short} endoscopy`,
    detail: `Reporting time ${input.reportingTime}. Bring your prep form. If stool is still stages 1–4 on the guide, report 2 hours early and call first.`,
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
    title: 'Last meal on the eve of scope',
    detail: hospital.lastMeal,
    kind: 'meal',
    source: hospital.lastMealNote,
  })

  if (hospital.prepAgent === 'picoprep-4') {
    events.push({
      id: 'p1',
      at: atDate(input.date, -1, '18:00'),
      title: 'Picoprep packet 1',
      detail: mixPicoprep(1, '1 litre of clear fluid'),
      kind: 'dose',
      source: 'SGH/NCCS yellow form — mix 1 packet with 150ml water, follow with 1L clear fluid',
    })
    events.push({
      id: 'p2',
      at: atDate(input.date, -1, '21:00'),
      title: 'Picoprep packet 2',
      detail: mixPicoprep(2, '1 litre of clear fluid'),
      kind: 'dose',
      source: 'SGH/NCCS yellow form — packets 1 and 2 on the eve of scope (times are handwritten blanks)',
    })

    if (input.slot === 'am') {
      events.push({
        id: 'p3',
        at: atDate(input.date, 0, '04:30'),
        title: 'Picoprep packet 3 (before 6am)',
        detail: mixPicoprep(3, '1 litre of clear fluid'),
        kind: 'dose',
        source: 'SGH/NCCS yellow form — packets 3 and 4 on the morning of scope, before 6am',
      })
      events.push({
        id: 'p4',
        at: atDate(input.date, 0, '05:30'),
        title: 'Picoprep packet 4 (before 6am)',
        detail: mixPicoprep(4, '1 litre of clear fluid'),
        kind: 'dose',
        source: 'SGH/NCCS yellow form — packets 3 and 4 before 6am',
      })
      events.push({
        id: 'breakfast-am',
        at: atDate(input.date, 0, '06:00'),
        title: 'Morning meds + tiny breakfast, then stop food',
        detail:
          'Continue usual medications at 6am with a small amount of water. Breakfast only: 2 plain white bread (no kaya/butter/jam) OR 2 plain biscuits. No food after breakfast. Oral meds allowed up to 2 hours before the procedure.',
        kind: 'meal',
        source: 'SGH/NCCS yellow form — day of scope, morning',
      })
    } else {
      events.push({
        id: 'breakfast-pm',
        at: atDate(input.date, 0, '07:00'),
        title: 'Breakfast only — then no food',
        detail:
          'SGH form: 2 plain white bread or 2 plain biscuits. The printed form does not clearly spell out afternoon-slot breakfast. Confirm against the handwritten times on your yellow form.',
        kind: 'meal',
        source: 'SGH/NCCS yellow form — day of; F10 afternoon gap',
        tentative: true,
      })
      events.push({
        id: 'p3-pm',
        at: atDate(input.date, 0, '08:00'),
        title: 'Picoprep packet 3 — confirm handwritten time',
        detail:
          'The SGH yellow form does not print afternoon packet times (F10). Suggested split-dose placement only: take this morning so the last dose can finish 2–5 hours before your procedure. Use the time written on your form if it differs.',
        kind: 'gap',
        source: 'F10 · ESGE/USMSTF split-dose window (not printed on SGH form)',
        tentative: true,
      })
      const p4 = subHours(report, 5)
      events.push({
        id: 'p4-pm',
        at: p4,
        title: 'Picoprep packet 4 — confirm handwritten time',
        detail:
          'Suggested: start about 5 hours before reporting, finish at least 2 hours before. This is guideline timing, not an SGH printed instruction. Prefer the blanks on your yellow form.',
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
        title: 'Picoprep packet 1',
        detail:
          'No more food after 6pm. Dissolve 1st packet in 150ml water. Then 3 large cups (250ml each) of clear liquid spread over 1 hour 30 minutes.',
        kind: 'dose',
        source: 'SKH bowel preparation generator — Picoprep, morning session',
      })
      events.push({
        id: 'skh-p2',
        at: atDate(input.date, -1, '22:30'),
        title: 'Picoprep packet 2',
        detail:
          'Dissolve 2nd packet in 150ml water. Then 3 large cups of clear liquid spread over 1 hour.',
        kind: 'dose',
        source: 'SKH bowel preparation generator — Picoprep, morning session',
      })
    } else {
      events.push({
        id: 'skh-p1-pm',
        at: atDate(input.date, 0, '06:00'),
        title: 'Picoprep packet 1 (afternoon session)',
        detail:
          'Dissolve 1st packet in 150ml water, then 3 large cups (250ml) over 1 hour 30 minutes. Afternoon packet times are taken from SKH’s AM/PM generator pattern — confirm on the SKH website if your SMS differs.',
        kind: 'dose',
        source: 'SKH bowel preparation generator — afternoon session pattern',
        tentative: true,
      })
      events.push({
        id: 'skh-p2-pm',
        at: atDate(input.date, 0, '10:30'),
        title: 'Picoprep packet 2 (afternoon session)',
        detail:
          'Dissolve 2nd packet in 150ml water, then 3 large cups over 1 hour. No more fluids 4 hours before reporting.',
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
        title: 'Picoprep — evening dose',
        detail:
          'Follow the 8am–2pm Picoprep PDF you were given. Mix as instructed and drink the clear fluids listed there. This microsite does not replace the slot-specific TTSH PDF.',
        kind: 'dose',
        source: 'TTSH Picoprep 8AM–2PM PDF (slot-specific)',
      })
      events.push({
        id: 'ttsh-p2',
        at: atDate(input.date, 0, '05:00'),
        title: 'Picoprep — morning dose',
        detail: 'Take the morning dose on the TTSH AM PDF. Finish fluids per that sheet.',
        kind: 'dose',
        source: 'TTSH Picoprep 8AM–2PM PDF',
      })
    } else {
      events.push({
        id: 'ttsh-p1-pm',
        at: atDate(input.date, 0, '06:00'),
        title: 'Picoprep — first dose (PM slot)',
        detail: 'Use the 2pm–5pm Picoprep PDF. TTSH issues a separate sheet per slot — follow that over this summary.',
        kind: 'dose',
        source: 'TTSH Picoprep 2PM–5PM PDF',
      })
      events.push({
        id: 'ttsh-p2-pm',
        at: subHours(report, 5),
        title: 'Picoprep — second dose (PM slot)',
        detail: 'Second dose on the PM PDF, timed to your reporting slot.',
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
      title: 'PEG-ES — evening portion',
      detail:
        'CGH uses PEG-ES colonic lavage plus simeticone, not Picoprep. Follow the volumes and times on your CGH brochure. This card is a placeholder so the day structure is visible.',
      kind: 'dose',
      source: 'CGH brochure June 2026 — PEG-ES + simeticone',
      tentative: true,
    })
    events.push({
      id: 'cgh-bfast',
      at: atDate(input.date, 0, '06:00'),
      title: 'Light breakfast, then stop 6 hours before',
      detail:
        'CGH: 1 slice bread or 2 biscuits or a small bowl of plain pasta. BP medications at 6am. No diabetic medication. Stop eating 6 hours before the procedure.',
      kind: 'meal',
      source: 'CGH brochure June 2026',
    })
    events.push({
      id: 'cgh-peg-am',
      at: atDate(input.date, 0, '06:30'),
      title: 'PEG-ES — morning portion',
      detail: 'Complete the morning PEG as your CGH brochure specifies.',
      kind: 'dose',
      source: 'CGH brochure June 2026',
      tentative: true,
    })
  }

  events.push({
    id: 'stool-check',
    at: subHours(report, 3),
    title: 'Check your stool against the colour scale',
    detail: hospital.stoolAction,
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
