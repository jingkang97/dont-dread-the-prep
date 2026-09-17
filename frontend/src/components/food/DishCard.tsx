import { useState } from 'react'
import type { ApiDish, ApiDishVerdict, ApiFoodClassification } from '../../lib/api'
import type { Verdict } from '../../data/foods'
import { useLang } from '../../i18n/LanguageContext'
import { Card, VerdictPill } from '../ui'

// Ingredients are Yes or No, never "Possible": anything the sheet has not
// cleared ('review' included) is shown as a No, i.e. something to leave out.
// "Possible" is a dish-level answer — see toDishVerdict.
function toIngredientVerdict(classification: ApiFoodClassification): Verdict {
  return classification === 'can' ? 'yes' : 'no'
}

// 'review' only reaches here for a dish with no ingredients on file; it reads
// as "Possible" rather than "Ask your care team", same wording as a dish the
// backend downgraded.
function toDishVerdict(verdict: ApiDishVerdict): Verdict {
  if (verdict === 'can') return 'yes'
  if (verdict === 'cannot') return 'no'
  return 'possible'
}

// Roughly two lines at this type size. Longer reasons collapse so the card stays
// scannable; the full wording is one tap away rather than truncated, because a
// half-shown clinical reason is worse than a short one.
const REASON_CLAMP_CHARS = 110

function Reason({ text }: { text: string }) {
  const { t } = useLang()
  const [expanded, setExpanded] = useState(false)
  const clampable = text.length > REASON_CLAMP_CHARS

  if (!clampable) {
    return <p className="mt-0.5 text-[12px] leading-snug text-muted">{text}</p>
  }
  return (
    <button
      type="button"
      onClick={() => setExpanded((v) => !v)}
      className="mt-0.5 block text-left text-[12px] leading-snug text-muted"
      aria-expanded={expanded}
    >
      <span className={expanded ? undefined : 'line-clamp-2'}>{text}</span>
      <span className="mt-0.5 block font-medium text-navy">
        {expanded ? t('food.reasonLess') : t('food.reasonMore')}
      </span>
    </button>
  )
}

export function DishCard({
  dish,
  footnote,
  hideApproved = false,
}: {
  dish: ApiDish
  footnote?: string
  hideApproved?: boolean
}) {
  const { t } = useLang()
  const dishVerdict = toDishVerdict(dish.verdict)
  const showDishPill = !(hideApproved && dishVerdict === 'yes')
  return (
    <Card className="p-3.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[16px] font-semibold text-ink">{dish.name}</p>
        {showDishPill ? <VerdictPill verdict={dishVerdict} /> : null}
      </div>
      {dish.verdict === 'possible' && dish.remove_ingredients.length > 0 && (
        <p className="mt-1 text-[13px] font-medium text-possible">
          {t('food.possibleNote', { ingredients: dish.remove_ingredients.join(', ') })}
        </p>
      )}
      <div className="mt-2.5 grid gap-1.5">
        {dish.ingredients.map((ingredient) => {
          const verdict = toIngredientVerdict(ingredient.classification)
          const showPill = !(hideApproved && verdict === 'yes')
          return (
            <div
              key={ingredient.id}
              className="flex items-start justify-between gap-2 rounded-xl bg-paper px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-ink">{ingredient.name}</p>
                <Reason text={ingredient.classification_reason} />
              </div>
              {showPill ? <VerdictPill verdict={verdict} compact /> : null}
            </div>
          )
        })}
      </div>
      {footnote && <p className="mt-2.5 text-[11px] text-muted">{footnote}</p>}
    </Card>
  )
}
