import type { ApiDish, ApiFoodClassification } from '../../lib/api'
import type { Verdict } from '../../data/foods'
import { Card, VerdictPill } from '../ui'

function toVerdict(classification: ApiFoodClassification): Verdict {
  if (classification === 'can') return 'yes'
  if (classification === 'cannot') return 'no'
  return 'ask'
}

export function DishCard({ dish, footnote }: { dish: ApiDish; footnote?: string }) {
  return (
    <Card className="p-3.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[16px] font-semibold text-ink">{dish.name}</p>
        <VerdictPill verdict={toVerdict(dish.verdict)} />
      </div>
      <div className="mt-2.5 grid gap-1.5">
        {dish.ingredients.map((ingredient) => (
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
            <VerdictPill verdict={toVerdict(ingredient.classification)} compact />
          </div>
        ))}
      </div>
      {footnote && <p className="mt-2.5 text-[11px] text-muted">{footnote}</p>}
    </Card>
  )
}
