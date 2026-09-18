import { useEffect } from 'react'
import type { ApiDish, ApiHospital, ApiMealPrep } from '../lib/api'
import type { TimelineEvent } from '../lib/timeline'
import { useLang } from './LanguageContext'

const HELP_COPY = [
  'How to mix PEG',
  'How to mix Picoprep',
  'Enema positions',
  'Medicines to review 7 days before',
  'Picoprep',
  'This is a drug (laxative) which stimulates the muscle in the intestines, in order to create bowel movements (pass motion). You may experience stomach cramps and diarrhoea after taking the medication. Mix as shown below.',
  'PEG',
  'PEG is used to clean out the gastrointestinal tract (stomach and intestines). You may experience diarrhoea, nausea and/or stomach cramps after taking the medication. Mix as shown below.',
  'Fleet Enema',
  'Position for using an enema:',
  'Left-side position',
  'Lie on left side, knee bent, and arms resting comfortably.',
  'Knee-chest position',
  'Kneel, then lower head and chest forward until the left side of your face is resting on the surface with left arm folded comfortably.',
  'Do not stop any medication unless your doctor or hospital has told you to. If unsure, ask your care team.',
  'Blood-thinning medication',
  'Aspirin (Cardiprin), Warfarin (Marevan), Clopidogrel (Placta), Ticlopidine (Ticlid), Dipyridamole (Perazodin), Rivaroxaban (Xarelto), Apixaban (Eliquis)',
  'Possibly blood-thinning supplements',
  "Echinacea, Ephedra, Garlic, Ginkgo (Tanakan), Ginseng, Valerian, Hypericum (St John's Wort), Kava (Kavain), Traditional Chinese Medicine (TCM), Ayurvedic, Jamu",
  'Iron supplements',
  'Ferrous Gluconate (Sangobion), Iron hydroxide polymaltose complex tablet and drops (Maltofer)',
]

const FOOD_SUGGESTIONS = [
  'Chicken rice',
  'Kopi with milk',
  'Apple juice',
  'Milo',
  'White bread',
  'Thosai',
  'Char kway teow',
]

function push(out: string[], value?: string | null) {
  const text = value?.trim()
  if (text) out.push(text)
}

function dishCopy(dish: ApiDish, out: string[]) {
  push(out, dish.name)
  for (const name of dish.remove_ingredients) push(out, name)
  for (const ingredient of dish.ingredients) {
    push(out, ingredient.name)
    push(out, ingredient.classification_reason)
  }
}

export function hospitalLiveCopy(hospital: ApiHospital): string[] {
  const out: string[] = []
  push(out, hospital.short_name)
  push(out, hospital.name)
  push(out, hospital.cluster)
  for (const protocol of hospital.protocols) push(out, protocol.prep_agent_label)
  for (const contact of hospital.contacts) {
    push(out, contact.label)
    push(out, contact.hours)
    push(out, contact.note)
  }
  const scale = hospital.stool_scale
  push(out, scale?.not_ready_action)
  for (const stage of scale?.stages ?? []) {
    push(out, stage.name)
    push(out, stage.look)
  }
  return out
}

export function timelineLiveCopy(events: TimelineEvent[]): string[] {
  const out = [...HELP_COPY]
  for (const event of events) {
    push(out, event.title)
    push(out, event.detail)
    push(out, event.citedDetail)
  }
  return out
}

export function mealPrepLiveCopy(mealPrep: ApiMealPrep | null): string[] {
  const out = [...FOOD_SUGGESTIONS]
  if (!mealPrep) return out
  for (const dish of [
    ...mealPrep.breakfast,
    ...mealPrep.lunch,
    ...mealPrep.dinner,
    ...mealPrep.snacks,
    ...mealPrep.drinks,
  ]) {
    dishCopy(dish, out)
  }
  return out
}

export function usePrimeLiveCopy(texts: string[]) {
  const { prime } = useLang()
  const key = texts.join('\u0001')
  useEffect(() => {
    if (!key) return
    prime(key.split('\u0001'))
  }, [key, prime])
}

export { FOOD_SUGGESTIONS }
