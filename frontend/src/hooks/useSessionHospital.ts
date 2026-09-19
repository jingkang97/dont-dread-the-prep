import { useEffect, useState } from 'react'
import { useApiHospitals } from './useApiHospitals'
import { hospitalLiveCopy, usePrimeLiveCopy } from '../i18n/liveCopy'
import { ApiError, getApiHospital, type ApiHospital } from '../lib/api'
import { EN } from '../i18n/strings'

const extraByCode = new Map<string, ApiHospital>()

export function useSessionHospital(session: {
  hospitalId: string
  hospitalShort?: string
}) {
  const { apiHospitals, hospitalsLoading, hospitalsError } = useApiHospitals()
  const listed = apiHospitals.find((h) => h.code === session.hospitalId) ?? extraByCode.get(session.hospitalId) ?? null
  const [extra, setExtra] = useState<ApiHospital | null>(() => extraByCode.get(session.hospitalId) ?? null)
  const [extraLoading, setExtraLoading] = useState(!listed && !extraByCode.has(session.hospitalId))
  const [extraError, setExtraError] = useState<string | null>(null)

  useEffect(() => {
    const fromList = apiHospitals.find((h) => h.code === session.hospitalId)
    if (fromList) {
      setExtra(null)
      setExtraError(null)
      setExtraLoading(false)
      return
    }
    const cached = extraByCode.get(session.hospitalId)
    if (cached) {
      setExtra(cached)
      setExtraError(null)
      setExtraLoading(false)
      return
    }
    if (hospitalsLoading) return
    let cancelled = false
    setExtraLoading(true)
    getApiHospital(session.hospitalId)
      .then((row) => {
        if (cancelled) return
        extraByCode.set(session.hospitalId, row)
        setExtra(row)
        setExtraError(null)
      })
      .catch((err) => {
        if (cancelled) return
        setExtra(null)
        setExtraError(err instanceof ApiError ? err.detail : EN['err.hospitals'])
      })
      .finally(() => {
        if (!cancelled) setExtraLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [apiHospitals, hospitalsLoading, session.hospitalId])

  const hospital = apiHospitals.find((h) => h.code === session.hospitalId) ?? extra
  const short = session.hospitalShort || hospital?.short_name || session.hospitalId
  usePrimeLiveCopy(hospital ? hospitalLiveCopy(hospital) : [])

  return {
    hospital,
    short,
    loading: hospitalsLoading || extraLoading,
    error: hospital ? null : extraError ?? hospitalsError,
  }
}
