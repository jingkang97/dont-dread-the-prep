import { useState } from 'react'
import { GeneratingPane, VerdictMark } from '../ui'
import { DishCard } from './DishCard'
import { useMealPrep } from '../../hooks/useMealPrep'
import { CUISINES, type Cuisine } from '../../data/cuisine'
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

// The rule behind every list below, in two lines. Dish cards answer "is this
// one OK?"; this answers "what am I looking for?" — so it sits in the scroll
// area and moves out of the way once you start reading dishes.
function MealSummary() {
  const { t } = useLang()
  return (
    <div className="mb-3 grid gap-2 rounded-2xl bg-paper-2 px-3.5 py-3">
      {(['yes', 'no'] as const).map((verdict) => (
        <div key={verdict} className="flex items-start gap-2">
          <VerdictMark verdict={verdict} />
          <p className="text-[12px] leading-snug text-ink-soft">
            {t(verdict === 'yes' ? 'food.mealSummaryEat' : 'food.mealSummaryAvoid')}
          </p>
        </div>
      ))}
    </div>
  )
}

export function MealPrep({ session }: { session: PrepSession }) {
  const { t, tx } = useLang()
  const { mealPrep, loading, error } = useMealPrep(session.hospitalId)
  usePrimeLiveCopy(mealPrepLiveCopy(mealPrep))
  const [meal, setMeal] = useState<MealKey>('breakfast')
  const [cuisine, setCuisine] = useState<Cuisine | null>(null)

  const mealDishes: ApiDish[] = mealPrep ? dishesFor(mealPrep, meal) : []
  // Only the cuisines present in this meal get a chip — filtering breakfast by
  // "Malay" when the one Malay dish is a dessert would just empty the list. An
  // API-served hospital tags nothing, so the row disappears entirely.
  const cuisines = CUISINES.filter((c) => mealDishes.some((dish) => dish.cuisine === c.id))
  const dishes = cuisine ? mealDishes.filter((dish) => dish.cuisine === cuisine) : mealDishes

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 px-5 pb-3 pt-4">
        <div
          role="radiogroup"
          aria-label={t('food.tabMealPrep')}
          className="flex flex-wrap gap-1.5"
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
                onClick={() => {
                  setMeal(item.id)
                  setCuisine(null)
                }}
                className={cn(
                  'min-h-9 rounded-full px-3.5 text-[12px] font-medium',
                  on ? 'bg-teal-deep text-white' : 'bg-black/[0.06] text-navy',
                )}
              >
                {t(item.label)}
              </button>
            )
          })}
        </div>
        {cuisines.length > 1 && (
          <div
            role="radiogroup"
            aria-label={t('food.cuisineAll')}
            className="mt-2 flex flex-wrap gap-1.5"
          >
            {[{ id: null, label: 'food.cuisineAll' as StringKey }, ...cuisines].map((item) => {
              const on = cuisine === item.id
              return (
                <button
                  key={item.id ?? 'all'}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  data-demo={`food-cuisine-${item.id ?? 'all'}`}
                  onClick={() => setCuisine(item.id)}
                  className={cn(
                    'min-h-8 rounded-full px-3 text-[12px] font-medium',
                    on ? 'bg-navy text-white' : 'bg-black/[0.06] text-navy',
                  )}
                >
                  {t(item.label)}
                </button>
              )
            })}
          </div>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
        <MealSummary />
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
