const PHONE_SHORT_EDGE = 500

function angle() {
  if (typeof screen !== 'undefined' && screen.orientation) return screen.orientation.angle
  const legacy = (window as Window & { orientation?: number }).orientation
  return typeof legacy === 'number' ? legacy : 0
}

function tryNativeLock() {
  const lock = screen.orientation?.lock
  if (!lock) return
  void lock.call(screen.orientation, 'portrait').catch(() => {})
}

export function lockPhonePortrait() {
  const apply = () => {
    const w = window.innerWidth
    const h = window.innerHeight
    const phone = Math.min(w, h) <= PHONE_SHORT_EDGE
    const html = document.documentElement

    if (!phone) {
      html.removeAttribute('data-phone-rotate')
      return
    }

    tryNativeLock()

    if (w <= h) {
      html.removeAttribute('data-phone-rotate')
      return
    }

    const a = ((angle() % 360) + 360) % 360
    html.setAttribute('data-phone-rotate', a === 270 ? '90' : '-90')
  }

  apply()
  window.addEventListener('resize', apply)
  window.addEventListener('orientationchange', apply)
  screen.orientation?.addEventListener('change', apply)
}
