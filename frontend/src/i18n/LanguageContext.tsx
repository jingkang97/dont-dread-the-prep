import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { postApiTranslations } from '../lib/api/translations'
import { inlineMarkdown } from './inlineMarkdown'
import {
  catalogItems,
  isLang,
  translate,
  type Lang,
  type StringKey,
} from './strings'

type Overlay = Partial<Record<StringKey, string>>

type Ctx = {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: StringKey, vars?: Record<string, string>) => string
  tr: (key: StringKey, vars?: Record<string, string>) => ReactNode
  /** Translate hospital-sheet / API English. Returns English until the cache returns. */
  tx: (text: string) => string
  /** Queue hospital/API English for translation without waiting to render each string. */
  prime: (texts: Iterable<string>) => void
  /** True while a catalog or live translation request is in flight. */
  translating: boolean
}

const LanguageContext = createContext<Ctx | null>(null)

const HTML_LANG: Record<Lang, string> = {
  en: 'en-SG',
  zh: 'zh-Hans-SG',
  ms: 'ms-SG',
  ta: 'ta-SG',
}

const LANG_KEY = 'preppath.lang'
const OVERLAY_PREFIX = 'preppath.i18n.v2:'
const LIVE_CHUNK = 50

type CachedOverlay = { glossary: string; strings: Overlay; live?: Record<string, string> }

function readStoredLang(): Lang {
  try {
    const raw = localStorage.getItem(LANG_KEY)
    if (raw && isLang(raw)) return raw
  } catch {
    /* private mode */
  }
  return 'en'
}

function readCache(lang: Lang): CachedOverlay | null {
  if (lang === 'en') return null
  try {
    const raw = localStorage.getItem(OVERLAY_PREFIX + lang)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedOverlay
    if (
      parsed &&
      typeof parsed.glossary === 'string' &&
      parsed.strings &&
      typeof parsed.strings === 'object'
    ) {
      return parsed
    }
  } catch {
    /* ignore */
  }
  return null
}

function writeCache(lang: Lang, glossary: string, strings: Overlay, live: Record<string, string>) {
  try {
    localStorage.setItem(OVERLAY_PREFIX + lang, JSON.stringify({ glossary, strings, live }))
  } catch {
    /* ignore */
  }
}

function textKey(text: string) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return `x${(h >>> 0).toString(16)}${text.length.toString(16)}`.slice(0, 80)
}

function shouldLiveTranslate(text: string) {
  const src = text.trim()
  if (src.length < 2) return false
  if (/^[\d\s+\-()./:]+$/.test(src)) return false
  return true
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readStoredLang)
  const [overlay, setOverlay] = useState<Overlay>(() => readCache(readStoredLang())?.strings ?? {})
  const [live, setLive] = useState<Record<string, string>>(() => readCache(readStoredLang())?.live ?? {})
  const liveRef = useRef(live)
  liveRef.current = live
  const overlayRef = useRef(overlay)
  overlayRef.current = overlay
  const glossaryRef = useRef(readCache(readStoredLang())?.glossary ?? '')
  const pendingRef = useRef(new Set<string>())
  const inflightRef = useRef(new Set<string>())
  const scheduledRef = useRef(false)
  const catalogBusyRef = useRef(false)
  const liveBusyRef = useRef(false)
  const configuredRef = useRef(true)
  const skipRef = useRef(new Set<string>())
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [translating, setTranslating] = useState(false)
  const langRef = useRef(lang)
  langRef.current = lang

  const markTranslating = useCallback((active: boolean) => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current)
      idleTimerRef.current = null
    }
    if (active) {
      setTranslating(true)
      return
    }
    idleTimerRef.current = setTimeout(() => {
      idleTimerRef.current = null
      if (!catalogBusyRef.current && !liveBusyRef.current) setTranslating(false)
    }, 180)
  }, [])

  const disableLive = useCallback(() => {
    configuredRef.current = false
    pendingRef.current.clear()
    inflightRef.current.clear()
    catalogBusyRef.current = false
    liveBusyRef.current = false
    markTranslating(false)
  }, [markTranslating])

  useEffect(
    () => () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    },
    [],
  )

  const persist = useCallback(
    (nextOverlay: Overlay, nextLive: Record<string, string>) => {
      if (langRef.current === 'en' || !glossaryRef.current) return
      writeCache(langRef.current, glossaryRef.current, nextOverlay, nextLive)
    },
    [],
  )

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(LANG_KEY, next)
    } catch {
      /* ignore */
    }
    pendingRef.current.clear()
    inflightRef.current.clear()
    skipRef.current.clear()
    configuredRef.current = true
    catalogBusyRef.current = false
    liveBusyRef.current = false
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current)
      idleTimerRef.current = null
    }
    if (next === 'en') {
      setOverlay({})
      setLive({})
      setTranslating(false)
      return
    }
    const stored = readCache(next)
    setOverlay(stored?.strings ?? {})
    setLive(stored?.live ?? {})
    glossaryRef.current = stored?.glossary ?? ''
    const warm = stored?.strings && Object.keys(stored.strings).length > 0
    setTranslating(!warm)
  }, [])

  useEffect(() => {
    document.documentElement.lang = HTML_LANG[lang]
  }, [lang])

  useEffect(() => {
    if (lang === 'en') {
      catalogBusyRef.current = false
      markTranslating(false)
      return
    }
    const ac = new AbortController()
    const hasCache = Object.keys(overlayRef.current).length > 0
    catalogBusyRef.current = !hasCache
    if (!hasCache) markTranslating(true)
    postApiTranslations(lang, catalogItems(), ac.signal)
      .then((res) => {
        if (ac.signal.aborted) return
        if (!res.configured) {
          disableLive()
          return
        }
        glossaryRef.current = res.glossary
        const prev = readCache(lang)
        const merged: Overlay =
          prev?.glossary === res.glossary ? { ...prev.strings, ...res.strings } : res.strings
        const nextLive =
          prev?.glossary === res.glossary ? { ...(prev.live ?? {}), ...liveRef.current } : liveRef.current
        setOverlay(merged)
        setLive(nextLive)
        writeCache(lang, res.glossary, merged, nextLive)
      })
      .catch(() => {
        /* keep English / cached overlay */
      })
      .finally(() => {
        if (ac.signal.aborted) return
        catalogBusyRef.current = false
        markTranslating(false)
      })
    return () => ac.abort()
  }, [disableLive, lang, markTranslating])

  const flushLive = useCallback(async () => {
    const currentLang = langRef.current
    if (currentLang === 'en' || !configuredRef.current) {
      liveBusyRef.current = false
      markTranslating(false)
      return
    }
    const batch = [...pendingRef.current].filter(
      (text) =>
        !inflightRef.current.has(text) && !liveRef.current[text] && !skipRef.current.has(text),
    )
    pendingRef.current.clear()
    if (!batch.length) {
      liveBusyRef.current = false
      markTranslating(false)
      return
    }
    liveBusyRef.current = true
    if (!Object.keys(overlayRef.current).length) markTranslating(true)
    for (const text of batch) inflightRef.current.add(text)
    try {
      for (let i = 0; i < batch.length; i += LIVE_CHUNK) {
        const slice = batch.slice(i, i + LIVE_CHUNK)
        const res = await postApiTranslations(
          currentLang,
          slice.map((text) => ({ key: textKey(text), text: text.slice(0, 5000) })),
        )
        if (langRef.current !== currentLang) return
        if (!res.configured) {
          disableLive()
          return
        }
        glossaryRef.current = res.glossary
        const next: Record<string, string> = {}
        for (const text of slice) {
          const translated = res.strings[textKey(text)]
          if (translated) next[text] = translated
        }
        if (!Object.keys(next).length) continue
        setLive((prev) => {
          const merged = { ...prev, ...next }
          persist(overlayRef.current, merged)
          return merged
        })
      }
    } catch {
      for (const text of batch) skipRef.current.add(text)
    } finally {
      for (const text of batch) inflightRef.current.delete(text)
      liveBusyRef.current = configuredRef.current && pendingRef.current.size > 0
      markTranslating(liveBusyRef.current)
    }
  }, [disableLive, markTranslating, persist])

  const scheduleFlush = useCallback(() => {
    if (scheduledRef.current) return
    scheduledRef.current = true
    queueMicrotask(() => {
      scheduledRef.current = false
      void flushLive()
    })
  }, [flushLive])

  const enqueue = useCallback(
    (text: string) => {
      if (langRef.current === 'en' || !configuredRef.current || !shouldLiveTranslate(text)) return
      if (liveRef.current[text] || inflightRef.current.has(text) || skipRef.current.has(text)) return
      pendingRef.current.add(text)
    },
    [],
  )

  const tx = useCallback(
    (text: string) => {
      if (lang === 'en' || !shouldLiveTranslate(text)) return text
      const hit = live[text]
      if (hit) return hit
      enqueue(text)
      scheduleFlush()
      return text
    },
    [enqueue, lang, live, scheduleFlush],
  )

  const prime = useCallback(
    (texts: Iterable<string>) => {
      if (lang === 'en') return
      let queued = false
      for (const text of texts) {
        const before = pendingRef.current.size
        enqueue(text)
        if (pendingRef.current.size > before) queued = true
      }
      if (queued) scheduleFlush()
    },
    [enqueue, lang, scheduleFlush],
  )

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang,
      t: (key, vars) => translate(key, vars, overlay),
      tr: (key, vars) => inlineMarkdown(translate(key, vars, overlay)),
      tx,
      prime,
      translating,
    }),
    [lang, overlay, prime, setLang, translating, tx],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang outside provider')
  return ctx
}
