export type HospitalId = 'sgh' | 'nccs' | 'ttsh' | 'skh' | 'cgh'
export type Slot = 'am' | 'pm'
export type PrepAgent = 'picoprep-4' | 'picoprep-2' | 'peg'

export type Contact = {
  label: string
  phone: string
  hours: string
  note: string
}

export type Hospital = {
  id: HospitalId
  short: string
  name: string
  cluster: string
  protocol: 'sgh-nccs' | 'ttsh' | 'skh' | 'cgh'
  prepAgent: PrepAgent
  prepAgentLabel: string
  dietDays: number
  lastMeal: string
  lastMealNote: string
  fluidStopHours: number
  milkInCoffee: 'yes' | 'no'
  fruitJuice: 'yes' | 'no' | 'ask'
  riceCereal: 'yes' | 'no' | 'ask'
  coffeeTea: 'yes' | 'no'
  stoolScale: 'none' | 'ttsh-6' | 'skh-5'
  stoolAction: string
  contacts: Contact[]
  formGap: string
  accent: string
}

export const HOSPITALS: Record<HospitalId, Hospital> = {
  sgh: {
    id: 'sgh',
    short: 'SGH',
    name: 'Singapore General Hospital',
    cluster: 'SingHealth',
    protocol: 'sgh-nccs',
    prepAgent: 'picoprep-4',
    prepAgentLabel: 'Picoprep · 4 sachets',
    dietDays: 3,
    lastMeal: 'No food after dinner on the eve of scope',
    lastMealNote: 'SGH/NCCS yellow form. Do not generalise from TTSH 6:30pm or SKH 6pm.',
    fluidStopHours: 2,
    milkInCoffee: 'no',
    fruitJuice: 'no',
    riceCereal: 'no',
    coffeeTea: 'yes',
    stoolScale: 'none',
    stoolAction:
      'SGH form has no stool chart. This guide adapts TTSH’s 6-point scale so you have a way to check. If stool still looks like stages 1–4, call the number below or report 2 hours early.',
    contacts: [
      {
        label: 'Ambulatory Endoscopy Centre',
        phone: '63266131',
        hours: 'Confirm hours with your care team',
        note: 'The yellow form prints no telephone number (F9). This is the publicly listed AEC line — confirm it at counselling.',
      },
      {
        label: 'SGH general enquiries',
        phone: '62223322',
        hours: '24-hour switchboard',
        note: 'Ask to be put through to endoscopy if the AEC line is closed.',
      },
    ],
    formGap: 'Times for Picoprep are handwritten blanks. Afternoon slots are not printed.',
    accent: '#c4921a',
  },
  nccs: {
    id: 'nccs',
    short: 'NCCS',
    name: 'National Cancer Centre Singapore',
    cluster: 'SingHealth',
    protocol: 'sgh-nccs',
    prepAgent: 'picoprep-4',
    prepAgentLabel: 'Picoprep · 4 sachets',
    dietDays: 3,
    lastMeal: 'No food after dinner on the eve of scope',
    lastMealNote: 'Shared SGH/NCCS yellow form.',
    fluidStopHours: 2,
    milkInCoffee: 'no',
    fruitJuice: 'no',
    riceCereal: 'no',
    coffeeTea: 'yes',
    stoolScale: 'none',
    stoolAction:
      'The SGH/NCCS form has no stool chart. This guide adapts TTSH’s 6-point scale. If stool still looks like stages 1–4, call the number below or report 2 hours early.',
    contacts: [
      {
        label: 'NCCS main line',
        phone: '64368088',
        hours: 'Confirm hours with your care team',
        note: 'The yellow form prints no number. Confirm the endoscopy contact given at counselling.',
      },
      {
        label: 'SGH Ambulatory Endoscopy Centre',
        phone: '63266131',
        hours: 'Confirm hours with your care team',
        note: 'NCCS procedures often run through the SGH endoscopy pathway. Confirm which number applies to you.',
      },
    ],
    formGap: 'Medication stop dates live on a separate handwritten annex, not the yellow form.',
    accent: '#1b7a6e',
  },
  ttsh: {
    id: 'ttsh',
    short: 'TTSH',
    name: 'Tan Tock Seng Hospital',
    cluster: 'NHG',
    protocol: 'ttsh',
    prepAgent: 'picoprep-2',
    prepAgentLabel: 'Picoprep (slot-specific PDF)',
    dietDays: 3,
    lastMeal: 'Light dinner until 6:30pm on the eve of scope',
    lastMealNote: 'TTSH brochure March 2026. Different from SGH (after dinner) and SKH (after 6pm).',
    fluidStopHours: 2,
    milkInCoffee: 'yes',
    fruitJuice: 'ask',
    riceCereal: 'no',
    coffeeTea: 'yes',
    stoolScale: 'ttsh-6',
    stoolAction:
      'If stool still looks like stages 1–4, report 2 hours early and call Endo PACE / the endoscopy centre.',
    contacts: [
      {
        label: 'Endo PACE',
        phone: '63573766',
        hours: 'Mon–Fri 8:00am–5:00pm',
        note: 'Publicly listed on the TTSH Endoscopy Centre page. TTSH is the only sheet with a reachable after-hours pathway via central hotline.',
      },
      {
        label: 'Endoscopy Centre',
        phone: '63578485',
        hours: 'Mon–Fri 8:00am–5:00pm; closed weekends & PH',
        note: 'Level 2, TTSH Atrium Block.',
      },
      {
        label: 'Central hotline',
        phone: '63577000',
        hours: 'Mon–Fri 8:00am–5:00pm; Sat 8:00am–12:00pm',
        note: 'Use this if clinic lines are closed. Confirm after-hours coverage with your care team.',
      },
    ],
    formGap: 'TTSH issues separate PDFs per appointment slot.',
    accent: '#1b4d8c',
  },
  skh: {
    id: 'skh',
    short: 'SKH',
    name: 'Sengkang General Hospital',
    cluster: 'SingHealth',
    protocol: 'skh',
    prepAgent: 'picoprep-2',
    prepAgentLabel: 'Picoprep · 2 packets',
    dietDays: 3,
    lastMeal: 'No food after 6pm on the eve of scope',
    lastMealNote: 'SKH website. Different from SGH (after dinner) and TTSH (6:30pm).',
    fluidStopHours: 4,
    milkInCoffee: 'no',
    fruitJuice: 'yes',
    riceCereal: 'yes',
    coffeeTea: 'no',
    stoolScale: 'skh-5',
    stoolAction:
      'SKH uses a 5-point cup chart (no action trigger). Stages 1–3 = not ready. If you are not at “yellow, light, clear”, call SKH before leaving home.',
    contacts: [
      {
        label: 'Sengkang General Hospital',
        phone: '69306000',
        hours: 'Confirm hours with your care team',
        note: 'SKH website does not print an after-hours prep hotline. Confirm the number given at counselling.',
      },
    ],
    formGap: 'SKH already generates a personalised timeline on its website — this microsite mirrors that pattern for demo.',
    accent: '#e86d1f',
  },
  cgh: {
    id: 'cgh',
    short: 'CGH',
    name: 'Changi General Hospital',
    cluster: 'SingHealth',
    protocol: 'cgh',
    prepAgent: 'peg',
    prepAgentLabel: 'PEG-ES + simeticone',
    dietDays: 3,
    lastMeal: 'Light breakfast on the day — stop eating 6 hours before',
    lastMealNote: 'CGH brochure June 2026. 1 slice bread or 2 biscuits or a small bowl of plain pasta.',
    fluidStopHours: 2,
    milkInCoffee: 'no',
    fruitJuice: 'ask',
    riceCereal: 'ask',
    coffeeTea: 'yes',
    stoolScale: 'none',
    stoolAction:
      'CGH brochure has no stool chart. This guide adapts TTSH’s 6-point scale. If stool still looks like stages 1–4, call during office hours.',
    contacts: [
      {
        label: 'CGH main line',
        phone: '67888833',
        hours: 'Office hours only on the CGH sheet',
        note: 'CGH lists clinic numbers for office hours only — there is no printed after-hours prep hotline.',
      },
      {
        label: 'Appointment centre',
        phone: '68503333',
        hours: 'Office hours — confirm with your care team',
        note: 'Publicly listed appointment line, not a night-before clinical hotline.',
      },
    ],
    formGap: 'Prep agent is PEG, not Picoprep. Day-of meds: BP at 6am; no diabetic medication.',
    accent: '#0f5b52',
  },
}

export const HOSPITAL_LIST = Object.values(HOSPITALS)

export function formatPhone(phone: string) {
  if (phone.length === 8) return `${phone.slice(0, 4)} ${phone.slice(4)}`
  return phone
}

export function telHref(phone: string) {
  return `tel:+65${phone}`
}
