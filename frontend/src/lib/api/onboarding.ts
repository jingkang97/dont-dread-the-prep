import type { ApiProtocolSummary } from './hospitals'

/** First protocol from GET /hospitals (already listed chips only). */
export function defaultProtocolName(
  protocols: Pick<ApiProtocolSummary, 'name'>[],
  _hospitalCode?: string | null,
): string | null {
  return protocols[0]?.name ?? null
}
