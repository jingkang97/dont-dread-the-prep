import { useEffect, useState } from 'react'
import { ApiError, getApiMealPrep, type ApiMealPrep } from '../lib/api'

const cache = new Map<string, ApiMealPrep>()
const errorCache = new Map<string, string>()

export function useMealPrep(hospitalId: string) {
  const [mealPrep, setMealPrep] = useState<ApiMealPrep | null>(cache.get(hospitalId) ?? null)
  const [loading, setLoading] = useState(!cache.has(hospitalId))
  const [error, setError] = useState<string | null>(errorCache.get(hospitalId) ?? null)

  useEffect(() => {
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
          err instanceof ApiError ? err.detail : 'Could not load meal suggestions. Try again shortly.'
        errorCache.set(hospitalId, detail)
        setError(detail)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [hospitalId])

  return { mealPrep, loading, error }
}
