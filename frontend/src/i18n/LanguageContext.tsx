import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { inlineMarkdown } from './inlineMarkdown'
import { translate, type Lang, type StringKey } from './strings'

type Ctx = {
  lang: Lang
  t: (key: StringKey, vars?: Record<string, string>) => string
  tr: (key: StringKey, vars?: Record<string, string>) => ReactNode
}

const LanguageContext = createContext<Ctx | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.lang = 'en-SG'
    localStorage.removeItem('preppath.lang')
  }, [])

  const value = useMemo<Ctx>(
    () => ({
      lang: 'en',
      t: (key, vars) => translate(key, vars),
      tr: (key, vars) => inlineMarkdown(translate(key, vars)),
    }),
    [],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang outside provider')
  return ctx
}
