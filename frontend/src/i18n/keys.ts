import type { RuleId } from '../data/foods'
import type { HospitalId } from '../data/hospitals'
import { isStringKey, type StringKey } from './strings'

export type HospCopyField = 'name' | 'prep' | 'stoolAction' | 'formGap'
export type ContactField = 'label' | 'hours' | 'note'
export type StoolStageN = 1 | 2 | 3 | 4 | 5 | 6

/** Compile-fails if `hosp.{id}.{field}` is missing from the EN catalog. */
export function hospCopyKey<Id extends HospitalId, F extends HospCopyField>(
  id: Id,
  field: F,
): Extract<StringKey, `hosp.${Id}.${F}`> {
  return `hosp.${id}.${field}` as Extract<StringKey, `hosp.${Id}.${F}`>
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

/**
 * Contact rows are indexed from `hospital.contacts`. A missing catalog key
 * throws in dev instead of silently rendering the raw key.
 */
export function hospContactKey(id: HospitalId, index: number, field: ContactField): StringKey {
  const key = `hosp.${id}.c${index}.${field}`
  if (!isStringKey(key)) {
    throw new Error(`Missing copy key ${key}`)
  }
  return key
}
