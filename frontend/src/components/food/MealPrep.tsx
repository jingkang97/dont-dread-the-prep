import { useState } from 'react'
import { GeneratingPane } from '../ui'
import { DishCard } from './DishCard'
import { useMealPrep } from '../../hooks/useMealPrep'
import { useLang } from '../../i18n/LanguageContext'
import type { StringKey } from '../../i18n/strings'
import { cn } from '../../lib/cn'
import type { ApiDish } from '../../lib/api'
import type { PrepSession } from '../../lib/session'

type MealKey = 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'drinks'

const MEALS: { id: MealKey; label: StringKey }[] = [
  { id: 'breakfast', label: 'food.mealBreakfast' },
  { id: 'lunch', label: 'food.mealLunch' },
  { id: 'dinner', label: 'food.mealDinner' },
  { id: 'snacks', label: 'food.mealSnacks' },
  { id: 'drinks', label: 'food.mealDrinks' },
]

export function MealPrep({ session }: { session: PrepSession }) {
  const { t } = useLang()
  const { mealPrep, loading, error } = useMealPrep(session.hospitalId)
  const [meal, setMeal] = useState<MealKey>('breakfast')

  const dishes: ApiDish[] = mealPrep ? mealPrep[meal] : []

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
            hint={t('food.mealLoadingHint', { hospital: session.hospitalShort })}
          />
        )}
        {!loading && error && <p className="px-1 text-[14px] leading-relaxed text-ink-soft">{error}</p>}
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
