import { useApiHospitals } from './useApiHospitals'
import type { ApiHospital, ApiProtocolSummary } from '../lib/api/hospitals'

export function useSessionHospital(session: {
  hospitalId: string
  hospitalShort?: string
  protocolName?: string
}) {
  const { apiHospitals, hospitalsLoading } = useApiHospitals()
  const hospital = apiHospitals.find((h) => h.code === session.hospitalId) ?? null
  const protocol = protocolFor(hospital, session.protocolName)
  const short = session.hospitalShort || hospital?.short_name || session.hospitalId

  return { hospital, protocol, short, loading: hospitalsLoading }
}

function protocolFor(
  hospital: ApiHospital | null,
  protocolName?: string | null,
): ApiProtocolSummary | null {
  if (!hospital?.protocols.length) return null
  if (protocolName) {
    const hit = hospital.protocols.find((p) => p.name === protocolName)
    if (hit) return hit
  }
  return hospital.protocols[0] ?? null
}
