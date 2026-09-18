import { apiFetch } from './client'

export type TargetLang = 'zh' | 'ms' | 'ta'

export type TranslationOut = {
  lang: string
  configured: boolean
  glossary: string
  strings: Record<string, string>
}

export function postApiTranslations(
  lang: TargetLang,
  items: { key: string; text: string }[],
  signal?: AbortSignal,
) {
  return apiFetch<TranslationOut>('/api/translations', {
    method: 'POST',
    body: JSON.stringify({ lang, items }),
    signal,
  })
}
