import { useEffect, useState } from 'react'
import { ApiError, getApiMealPrep, type ApiMealPrep } from '../lib/api'
import { HARD_CODED_MEAL_PREP } from '../data/mealPlans'
import { EN } from '../i18n/strings'

const cache = new Map<string, ApiMealPrep>()
const errorCache = new Map<string, string>()

export function useMealPrep(hospitalId: string) {
  // TTSH and SKH are served from hard-coded plans rather than the endpoint —
  // see data/mealPlans.ts. Dropping a hospital's entry from HARD_CODED_MEAL_PREP
  // puts it back on the API.
  const hardCoded = HARD_CODED_MEAL_PREP[hospitalId.trim().toLowerCase()] ?? null
  const [mealPrep, setMealPrep] = useState<ApiMealPrep | null>(cache.get(hospitalId) ?? null)
  const [loading, setLoading] = useState(!hardCoded && !cache.has(hospitalId))
  const [error, setError] = useState<string | null>(errorCache.get(hospitalId) ?? null)

  useEffect(() => {
    if (hardCoded) return
    if (cache.has(hospitalId)) {
      setMealPrep(cache.get(hospitalId) ?? null)
      setError(errorCache.get(hospitalId) ?? null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    ;(async () => {
      try {
        const data = await getApiMealPrep(hospitalId)
        if (cancelled) return
        cache.set(hospitalId, data)
        setMealPrep(data)
        setError(null)
      } catch (err) {
        if (cancelled) return
        const detail =
          err instanceof ApiError ? err.detail : EN['err.mealPrep']
        errorCache.set(hospitalId, detail)
        setError(detail)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [hospitalId, hardCoded])

  if (hardCoded) return { mealPrep: hardCoded, loading: false, error: null }
  return { mealPrep, loading, error }
}
