import { driver, type DriveStep, type Side } from 'driver.js'
import 'driver.js/dist/driver.css'
import type { StringKey } from '../i18n/strings'

const SEEN = 'preppath.homeTour.v1'
const PENDING = 'preppath.homeTour.pending'

const STEPS: { element: string; title: StringKey; body: StringKey; side: Side }[] = [
  { element: '[data-tour="home-hero"]', title: 'tour.1t', body: 'tour.1d', side: 'bottom' },
  { element: '[data-tour="session-bar"]', title: 'tour.2t', body: 'tour.2d', side: 'bottom' },
  { element: '[data-tour="home-reminders"]', title: 'tour.3t', body: 'tour.3d', side: 'bottom' },
  { element: '[data-tour="home-tools"]', title: 'tour.4t', body: 'tour.4d', side: 'top' },
  { element: '[data-tour="bottom-nav"]', title: 'tour.5t', body: 'tour.5d', side: 'top' },
  { element: '[data-tour="home-shortcut"]', title: 'tour.6t', body: 'tour.6d', side: 'top' },
]

export function hasSeenHomeTour() {
  try {
    return localStorage.getItem(SEEN) === '1'
  } catch {
    return true
  }
}

export function queueHomeTour(force = false) {
  if (!force && hasSeenHomeTour()) return
  try {
    sessionStorage.setItem(PENDING, '1')
  } catch {
    /* ignore */
  }
}

export function homeTourPending() {
  try {
    return sessionStorage.getItem(PENDING) === '1'
  } catch {
    return false
  }
}

export function dropHomeTourPending() {
  try {
    sessionStorage.removeItem(PENDING)
  } catch {
    /* ignore */
  }
}

export function consumeHomeTourPending() {
  try {
    if (sessionStorage.getItem(PENDING) !== '1') return false
    sessionStorage.removeItem(PENDING)
    return true
  } catch {
    return false
  }
}

export function markHomeTourSeen() {
  try {
    localStorage.setItem(SEEN, '1')
    sessionStorage.removeItem(PENDING)
  } catch {
    /* ignore */
  }
}

/** First home visit is claimed so Start over / change date cannot re-queue the tour. */
export function rememberFirstHomeVisit() {
  try {
    localStorage.setItem(SEEN, '1')
  } catch {
    /* ignore */
  }
}

let active: ReturnType<typeof driver> | null = null
let skipSeenOnDestroy = false

function scrollHomeToTop() {
  const scroller = document.querySelector('[data-home-scroll]')
  if (scroller instanceof HTMLElement) {
    scroller.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  const pane = document.querySelector('[data-app-pane]')
  if (pane instanceof HTMLElement) pane.scrollTo({ top: 0, behavior: 'smooth' })
}

function tourTargetsReady() {
  return STEPS.some((step) => document.querySelector(step.element))
}

export function waitForTourTargets(timeoutMs = 2500) {
  if (tourTargetsReady()) return Promise.resolve(true)
  return new Promise<boolean>((resolve) => {
    const finish = (ok: boolean) => {
      window.clearTimeout(timer)
      observer.disconnect()
      resolve(ok)
    }
    const observer = new MutationObserver(() => {
      if (tourTargetsReady()) finish(true)
    })
    observer.observe(document.body, { childList: true, subtree: true })
    const timer = window.setTimeout(() => finish(tourTargetsReady()), timeoutMs)
  })
}

export function stopHomeTour() {
  const tour = active
  active = null
  if (!tour) return
  skipSeenOnDestroy = true
  try {
    tour.destroy()
  } finally {
    skipSeenOnDestroy = false
  }
}

export function startHomeTour(opts: { t: (key: StringKey) => string }) {
  const { t } = opts
  stopHomeTour()
  const steps: DriveStep[] = STEPS.filter((step) => document.querySelector(step.element)).map((step) => ({
    element: step.element,
    popover: {
      title: t(step.title),
      description: t(step.body),
      side: step.side,
      align: 'center',
    },
  }))
  if (steps.length === 0) return false

  consumeHomeTourPending()
  const tour = driver({
    steps,
    showProgress: true,
    allowClose: true,
    smoothScroll: true,
    overlayColor: 'rgba(28, 28, 30, 0.48)',
    stagePadding: 8,
    stageRadius: 16,
    popoverOffset: 10,
    popoverClass: 'preppath-tour',
    nextBtnText: t('tour.next'),
    prevBtnText: t('tour.back'),
    doneBtnText: t('tour.done'),
    progressText: '{{current}} / {{total}}',
    disableActiveInteraction: true,
    onDestroyed: () => {
      if (!skipSeenOnDestroy) markHomeTourSeen()
      if (active === tour) active = null
      scrollHomeToTop()
    },
  })
  active = tour
  tour.drive()
  return true
}
