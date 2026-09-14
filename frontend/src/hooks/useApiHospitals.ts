import { useEffect, useState } from 'react'
import { ApiError, listApiHospitals, type ApiHospital } from '../lib/api'

let cachedHospitals: ApiHospital[] | null = null
let cachedError: string | null = null

export function useApiHospitals() {
  const [apiHospitals, setApiHospitals] = useState<ApiHospital[]>(cachedHospitals ?? [])
  const [hospitalsLoading, setHospitalsLoading] = useState(cachedHospitals == null)
  const [hospitalsError, setHospitalsError] = useState<string | null>(cachedError)

  useEffect(() => {
    if (cachedHospitals) return
    let cancelled = false
    ;(async () => {
      try {
        const rows = await listApiHospitals()
        if (cancelled) return
        cachedHospitals = rows
        cachedError = rows.length
          ? null
          : 'No hospitals returned from the API. Check mvp.seed.sql was applied.'
        setApiHospitals(rows)
        setHospitalsError(cachedError)
      } catch (err) {
        if (cancelled) return
        cachedHospitals = null
        cachedError =
          err instanceof ApiError
            ? err.detail
            : 'Could not load hospitals. Is the API running on port 8000?'
        setApiHospitals([])
        setHospitalsError(cachedError)
      } finally {
        if (!cancelled) setHospitalsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { apiHospitals, hospitalsLoading, hospitalsError }
}
