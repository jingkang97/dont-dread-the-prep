import { useEffect, useRef } from 'react'
import { useLang } from '../i18n/LanguageContext'
import { consumeHomeTourPending, startHomeTour, stopHomeTour } from '../lib/homeTour'

export function useHomeTour(active: boolean) {
  const { t } = useLang()
  const started = useRef(false)

  useEffect(() => {
    if (!active || started.current) return
    if (!consumeHomeTourPending()) return
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
