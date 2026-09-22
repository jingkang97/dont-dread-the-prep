import { useState } from 'react'
import { GeneratingPane } from '../ui'
import { DishCard } from './DishCard'
import { useMealPrep } from '../../hooks/useMealPrep'
import { useLang } from '../../i18n/LanguageContext'
import { mealPrepLiveCopy, usePrimeLiveCopy } from '../../i18n/liveCopy'
import type { StringKey } from '../../i18n/strings'
import { cn } from '../../lib/cn'
import type { ApiDish, ApiMealPrep } from '../../lib/api'
import type { PrepSession } from '../../lib/session'

type MealKey = 'breakfast' | 'lunch' | 'snacks' | 'drinks'

// Lunch and dinner are one tab: no dish in dishes_tab carries one without the
// other, so the two lists came back identical and the tabs read as a choice
// that made no difference. The id stays 'lunch' — the demo script taps
// [data-demo="food-meal-lunch"].
const MEALS: { id: MealKey; label: StringKey }[] = [
  { id: 'breakfast', label: 'food.mealBreakfast' },
  { id: 'lunch', label: 'food.mealLunchDinner' },
  { id: 'snacks', label: 'food.mealSnacks' },
  { id: 'drinks', label: 'food.mealDrinks' },
]

// Identical today, merged by id rather than assumed: a dish seeded for dinner
// alone would otherwise be invisible with no dinner tab to show it.
function dishesFor(mealPrep: ApiMealPrep, meal: MealKey): ApiDish[] {
  if (meal !== 'lunch') return mealPrep[meal]
  const byId = new Map<number, ApiDish>()
  for (const dish of [...mealPrep.lunch, ...mealPrep.dinner]) byId.set(dish.id, dish)
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name))
}

export function MealPrep({ session }: { session: PrepSession }) {
  const { t, tx } = useLang()
  const { mealPrep, loading, error } = useMealPrep(session.hospitalId)
  usePrimeLiveCopy(mealPrepLiveCopy(mealPrep))
  const [meal, setMeal] = useState<MealKey>('breakfast')

  const dishes: ApiDish[] = mealPrep ? dishesFor(mealPrep, meal) : []

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 px-5 pb-3 pt-4">
        <div
          role="radiogroup"
          aria-label={t('food.tabMealPrep')}
          className="flex gap-1.5"
        >
          {MEALS.map((item) => {
            const on = meal === item.id
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={on}
                data-demo={`food-meal-${item.id}`}
                onClick={() => setMeal(item.id)}
                className={cn(
                  'min-h-9 min-w-0 flex-1 whitespace-nowrap rounded-full px-1.5 text-[12px] font-medium',
                  on ? 'bg-teal-deep text-white' : 'bg-black/[0.06] text-navy',
                )}
              >
                {t(item.label)}
              </button>
            )
          })}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
        {loading && (
          <GeneratingPane
            title={t('food.mealLoadingTitle')}
            hint={t('food.mealLoadingHint', { hospital: tx(session.hospitalShort) })}
          />
        )}
        {!loading && error && <p className="px-1 text-[14px] leading-relaxed text-ink-soft">{tx(error)}</p>}
        {!loading && !error && dishes.length === 0 && (
          <p className="px-1 text-[14px] leading-relaxed text-ink-soft">{t('food.mealEmpty')}</p>
        )}
        {!loading && !error && dishes.length > 0 && (
          <div className="grid gap-3">
            {dishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} hideApproved collapsible />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
