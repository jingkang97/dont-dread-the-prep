import type { RuleId } from '../data/foods'
import { isStringKey, type StringKey } from './strings'

export type HospCopyField = 'name' | 'prep' | 'stoolAction' | 'formGap'
export type ContactField = 'label' | 'hours' | 'note'
export type StoolStageN = 1 | 2 | 3 | 4 | 5 | 6

type Translate = (key: StringKey) => string

/** i18n key for a hospital field, or null when that site has no catalog copy. */
function hospCopyKey(id: string, field: HospCopyField): StringKey | null {
  const key = `hosp.${id}.${field}`
  return isStringKey(key) ? key : null
}

export function hospCopyOr(
  t: Translate,
  id: string,
  field: HospCopyField,
  fallback: string,
) {
  const key = hospCopyKey(id, field)
  return key ? t(key) : fallback
}

/** Compile-fails if `rule.{id}` is missing from the EN catalog. */
export function ruleTitleKey<R extends RuleId>(id: R): Extract<StringKey, `rule.${R}`> {
  return `rule.${id}` as Extract<StringKey, `rule.${R}`>
}

/** Compile-fails if `stool.s{n}n` / `stool.s{n}l` is missing from the EN catalog. */
export function stoolStageKey<N extends StoolStageN, Kind extends 'n' | 'l'>(
  n: N,
  kind: Kind,
): Extract<StringKey, `stool.s${N}${Kind}`> {
  return `stool.s${n}${kind}` as Extract<StringKey, `stool.s${N}${Kind}`>
}

function hospContactKey(id: string, index: number, field: ContactField): StringKey | null {
  const key = `hosp.${id}.c${index}.${field}`
  return isStringKey(key) ? key : null
}

export function hospContactOr(
  t: Translate,
  id: string,
  index: number,
  field: ContactField,
  fallback: string,
) {
  const key = hospContactKey(id, index, field)
  return key ? t(key) : fallback
}
