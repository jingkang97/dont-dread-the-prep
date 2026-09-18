import { apiFetch } from './client'

export type TargetLang = 'zh' | 'ms' | 'ta'

export type TranslationOut = {
  lang: string
  configured: boolean
  glossary: string
  strings: Record<string, string>
}

function mergeAbort(signal: AbortSignal | undefined, ms: number) {
  const timeout = AbortSignal.timeout(ms)
  if (!signal) return timeout
  if (typeof AbortSignal.any === 'function') return AbortSignal.any([signal, timeout])
  const ac = new AbortController()
  const abort = () => ac.abort()
  if (signal.aborted || timeout.aborted) {
    abort()
    return ac.signal
  }
  signal.addEventListener('abort', abort, { once: true })
  timeout.addEventListener('abort', abort, { once: true })
  return ac.signal
}

export function postApiTranslations(
  lang: TargetLang,
  items: { key: string; text: string }[],
  signal?: AbortSignal,
) {
  return apiFetch<TranslationOut>('/api/translations', {
    method: 'POST',
    body: JSON.stringify({ lang, items }),
    signal: mergeAbort(signal, 20_000),
  })
}
