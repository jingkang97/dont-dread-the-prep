import { useEffect, useState } from 'react'
import { isMvpHospitalId, MVP_HOSPITAL_IDS, type HospitalId } from '../data/hospitals'
import { ApiError, listApiHospitals, type ApiHospital } from '../lib/api'

export function useApiHospitals() {
  const [apiHospitals, setApiHospitals] = useState<ApiHospital[]>([])
  const [selectableIds, setSelectableIds] = useState<HospitalId[] | null>([...MVP_HOSPITAL_IDS])
  const [hospitalsError, setHospitalsError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const rows = await listApiHospitals()
        if (cancelled) return
        setApiHospitals(rows)
        const ids = rows
          .map((row) => row.code)
          .filter(isMvpHospitalId)
        setSelectableIds(ids.length ? ids : [])
        setHospitalsError(
          ids.length ? null : 'No hospitals returned from the API. Check mvp.seed.sql was applied.',
        )
      } catch (err) {
        if (cancelled) return
        setApiHospitals([])
        setSelectableIds([])
        setHospitalsError(
          err instanceof ApiError
            ? err.detail
            : 'Could not load hospitals. Is the API running on port 8000?',
        )
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { apiHospitals, selectableIds, hospitalsError }
}
