const PARAM = 'demo'

/** True only while `?demo=1` is in the URL. Normal patient use is unaffected. */
export function isDemoMode() {
  try {
    return new URLSearchParams(window.location.search).get(PARAM) === '1'
  } catch {
    return false
  }
}

let playing = false

export function setDemoPlaying(next: boolean) {
  playing = next
  try {
    document.documentElement.toggleAttribute('data-demo-playing', next)
  } catch {
    /* ignore */
  }
}

export function isDemoPlaying() {
  return playing
}
