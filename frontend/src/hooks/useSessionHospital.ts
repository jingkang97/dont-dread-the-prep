import { useApiHospitals } from './useApiHospitals'
import { hospitalLiveCopy, usePrimeLiveCopy } from '../i18n/liveCopy'

export function useSessionHospital(session: {
  hospitalId: string
  hospitalShort?: string
}) {
  const { apiHospitals, hospitalsLoading } = useApiHospitals()
  const hospital = apiHospitals.find((h) => h.code === session.hospitalId) ?? null
  const short = session.hospitalShort || hospital?.short_name || session.hospitalId
  usePrimeLiveCopy(hospital ? hospitalLiveCopy(hospital) : [])

  return { hospital, short, loading: hospitalsLoading }
}
