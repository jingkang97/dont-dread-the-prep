import type { ApiDish, ApiDishVerdict, ApiFoodClassification } from '../../lib/api'
import type { Verdict } from '../../data/foods'
import { useLang } from '../../i18n/LanguageContext'
import { Card, VerdictPill } from '../ui'

function toVerdict(classification: ApiFoodClassification): Verdict {
  if (classification === 'can') return 'yes'
  if (classification === 'cannot') return 'no'
  return 'ask'
}

function toDishVerdict(verdict: ApiDishVerdict): Verdict {
  if (verdict === 'possible') return 'possible'
  return toVerdict(verdict)
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
          const verdict = toVerdict(ingredient.classification)
          const showPill = !(hideApproved && verdict === 'yes')
          return (
            <div
              key={ingredient.id}
              className="flex items-start justify-between gap-2 rounded-xl bg-paper px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-ink">{ingredient.name}</p>
                <p className="mt-0.5 text-[12px] leading-snug text-muted">
                  {ingredient.classification_reason}
                </p>
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
