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

export function queueHomeTour() {
  if (hasSeenHomeTour()) return
  try {
    sessionStorage.setItem(PENDING, '1')
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

let active: ReturnType<typeof driver> | null = null

function scrollHomeToTop() {
  const pane = document.querySelector('[data-app-pane]')
  const scroller = pane?.firstElementChild
  if (scroller instanceof HTMLElement) {
    scroller.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  if (pane instanceof HTMLElement) pane.scrollTo({ top: 0, behavior: 'smooth' })
}

export function stopHomeTour() {
  const tour = active
  active = null
  tour?.destroy()
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
  if (steps.length === 0) {
    markHomeTourSeen()
    return
  }

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
      markHomeTourSeen()
      if (active === tour) active = null
      scrollHomeToTop()
    },
  })
  active = tour
  tour.drive()
}
