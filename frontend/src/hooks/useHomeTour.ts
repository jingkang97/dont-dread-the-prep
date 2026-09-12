import { useEffect, useRef } from 'react'
import { useLang } from '../i18n/LanguageContext'
import { consumeHomeTourPending, startHomeTour, stopHomeTour } from '../lib/homeTour'

function takeTourFlag() {
  const url = new URL(window.location.href)
  if (url.searchParams.get('tour') !== '1') return false
  url.searchParams.delete('tour')
  history.replaceState(history.state, '', `${url.pathname}${url.search}${url.hash}`)
  return true
}

export function useHomeTour(active: boolean) {
  const { t } = useLang()
  const started = useRef(false)

  useEffect(() => {
    if (!active || started.current) return
    const forced = takeTourFlag()
    if (!forced && !consumeHomeTourPending()) return
    started.current = true
    const frame = window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        startHomeTour({ t })
      }, 420)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [active, t])

  useEffect(() => () => stopHomeTour(), [])
}
