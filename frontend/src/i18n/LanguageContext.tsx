import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { inlineMarkdown } from './inlineMarkdown'
import { LANGS, translate, type Lang, type StringKey } from './strings'

const KEY = 'preppath.lang'

type Ctx = {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: StringKey, vars?: Record<string, string>) => string
  tr: (key: StringKey, vars?: Record<string, string>) => ReactNode
}

const LanguageContext = createContext<Ctx | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const saved = localStorage.getItem(KEY)
    if (LANGS.some((l) => l.id === saved)) setLangState(saved as Lang)
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-SG' : lang === 'ms' ? 'ms-SG' : lang === 'ta' ? 'ta-SG' : 'en-SG'
  }, [lang])

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang: (next) => {
        setLangState(next)
        localStorage.setItem(KEY, next)
      },
      t: (key, vars) => translate(lang, key, vars),
        tr: (key, vars) => inlineMarkdown(translate(lang, key, vars)),
    }),
    [lang],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang outside provider')
  return ctx
}
