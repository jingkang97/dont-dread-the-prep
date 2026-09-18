import { useEffect } from 'react'
import { useLang } from '../i18n/LanguageContext'
import { homeTourPending, queueHomeTour, rememberFirstHomeVisit, startHomeTour, stopHomeTour, waitForTourTargets } from '../lib/homeTour'

function takeTourFlag() {
  const url = new URL(window.location.href)
  if (url.searchParams.get('tour') !== '1') return false
  url.searchParams.delete('tour')
  history.replaceState(history.state, '', `${url.pathname}${url.search}${url.hash}`)
  return true
}

export function useHomeTour(active: boolean) {
  const { t } = useLang()

  useEffect(() => {
    if (!active) return
    if (takeTourFlag()) queueHomeTour(true)
    if (!homeTourPending()) return
    rememberFirstHomeVisit()

    let cancelled = false
    let timeoutId = 0
    const frame = window.requestAnimationFrame(() => {
      timeoutId = window.setTimeout(() => {
        void waitForTourTargets().then((ready) => {
          if (cancelled || !ready) return
          startHomeTour({ t })
        })
      }, 280)
    })
    return () => {
      cancelled = true
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timeoutId)
    }
  }, [active, t])

  useEffect(() => () => stopHomeTour(), [])
}
