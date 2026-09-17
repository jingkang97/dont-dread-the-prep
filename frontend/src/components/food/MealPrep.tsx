import { useState } from 'react'
import { SegmentedControl } from '../SegmentedControl'
import { GeneratingPane } from '../ui'
import { DishCard } from './DishCard'
import { useMealPrep } from '../../hooks/useMealPrep'
import { useLang } from '../../i18n/LanguageContext'
import type { ApiDish } from '../../lib/api'
import type { PrepSession } from '../../lib/session'

type MealKey = 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'drinks'

export function MealPrep({ session }: { session: PrepSession }) {
  const { t } = useLang()
  const { mealPrep, loading, error } = useMealPrep(session.hospitalId)
  const [meal, setMeal] = useState<MealKey>('breakfast')

  const dishes: ApiDish[] = mealPrep ? mealPrep[meal] : []

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 px-5 pb-3 pt-4">
        <SegmentedControl
          value={meal}
          onChange={setMeal}
          options={[
            { id: 'breakfast', label: t('food.mealBreakfast') },
            { id: 'lunch', label: t('food.mealLunch') },
            { id: 'dinner', label: t('food.mealDinner') },
            { id: 'snacks', label: t('food.mealSnacks') },
            { id: 'drinks', label: t('food.mealDrinks') },
          ]}
        />
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
