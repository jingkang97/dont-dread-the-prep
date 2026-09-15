import type { RuleId } from '../data/foods'
import { isStringKey, type StringKey } from './strings'

export type HospCopyField = 'name' | 'prep' | 'stoolAction' | 'formGap'

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
