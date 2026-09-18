import { isLang, type Lang } from './strings'

export const LANG_KEY = 'preppath.lang'
export const LANG_COOKIE = 'preppath_lang'
export const LANG_PARAM = 'lang'

function cookieLang(): string | null {
  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${LANG_COOKIE}=([^;]*)`))
    return match?.[1] ? decodeURIComponent(match[1]) : null
  } catch {
    return null
  }
}

/** Lang from URL, cookie, or localStorage — null if this storage never chose one. */
export function readExplicitLang(): Lang | null {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get(LANG_PARAM)
    if (fromUrl && isLang(fromUrl)) return fromUrl
  } catch {
    /* ignore */
  }
  const fromCookie = cookieLang()
  if (fromCookie && isLang(fromCookie)) return fromCookie
  try {
    const stored = localStorage.getItem(LANG_KEY)
    if (stored && isLang(stored)) return stored
  } catch {
    /* private mode */
  }
  return null
}

export function readStoredLang(): Lang {
  return readExplicitLang() ?? 'en'
}

export function persistLang(lang: Lang) {
  try {
    localStorage.setItem(LANG_KEY, lang)
  } catch {
    /* private mode */
  }
  try {
    const secure = window.location.protocol === 'https:' ? ';Secure' : ''
    if (lang === 'en') {
      document.cookie = `${LANG_COOKIE}=;Path=/;Max-Age=0;SameSite=Lax${secure}`
    } else {
      document.cookie = `${LANG_COOKIE}=${encodeURIComponent(lang)};Path=/;Max-Age=31536000;SameSite=Lax${secure}`
    }
  } catch {
    /* ignore */
  }
  try {
    const url = new URL(window.location.href)
    if (lang === 'en') url.searchParams.delete(LANG_PARAM)
    else url.searchParams.set(LANG_PARAM, lang)
    const next = `${url.pathname}${url.search}${url.hash}`
    const now = `${window.location.pathname}${window.location.search}${window.location.hash}`
    if (next !== now) history.replaceState(history.state, '', next)
  } catch {
    /* ignore */
  }
}

export function syncLangManifest(sessionId: string | null) {
  const lang = readExplicitLang()
  const params = new URLSearchParams()
  if (sessionId) params.set('s', sessionId)
  if (lang && lang !== 'en') params.set(LANG_PARAM, lang)
  const query = params.toString()
  const href = query ? `/manifest.webmanifest?${query}` : '/manifest.webmanifest'
  try {
    let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'manifest'
      document.head.appendChild(link)
    }
    if (link.getAttribute('href') !== href) link.setAttribute('href', href)
  } catch {
    /* ignore */
  }
}

function sessionIdFromStore(): string | null {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('s')
    if (fromUrl && /^[A-Z2-9]{4}$/i.test(fromUrl)) return fromUrl.toUpperCase()
    const raw = localStorage.getItem('preppath.session.v1')
    const id = raw ? (JSON.parse(raw) as { id?: unknown }).id : null
    return typeof id === 'string' ? id : null
  } catch {
    return null
  }
}

export function syncCurrentManifest() {
  syncLangManifest(sessionIdFromStore())
}
