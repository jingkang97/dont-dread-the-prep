export function isUsable(el: Element | null): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false
  if (el.closest('[aria-hidden="true"], .invisible')) return false
  const style = window.getComputedStyle(el)
  if (style.display === 'none' || style.visibility === 'hidden') return false
  const rect = el.getBoundingClientRect()
  if (rect.width <= 2 || rect.height <= 2) return false
  const host = document.querySelector('[data-app-column]')
  if (host instanceof HTMLElement) {
    const box = host.getBoundingClientRect()
    const overlapX = Math.min(rect.right, box.right) - Math.max(rect.left, box.left)
    if (overlapX < Math.min(rect.width, box.width) * 0.55) return false
  }
  return true
}

export function queryVisible(selector: string): HTMLElement | null {
  const nodes = document.querySelectorAll(selector)
  for (const node of nodes) {
    if (isUsable(node)) return node
  }
  return null
}

export function scrollIntoView(el: HTMLElement) {
  el.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'nearest' })
  const scroller = el.closest<HTMLElement>('.overflow-y-auto, [data-tl-scroll], [data-home-scroll]')
  if (!scroller || scroller === el) return
  const top =
    el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - 24
  scroller.scrollTo({ top: Math.max(0, top), behavior: 'auto' })
}

export function setNativeValue(el: HTMLInputElement, value: string) {
  const proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')
  proto?.set?.call(el, value)
  el.dispatchEvent(new Event('input', { bubbles: true }))
  el.dispatchEvent(new Event('change', { bubbles: true }))
}

export const HOSPITAL_QUERY_EVENT = 'preppath-demo-hospital-query'

export function setHospitalQuery(query: string) {
  window.dispatchEvent(new CustomEvent(HOSPITAL_QUERY_EVENT, { detail: { query } }))
}
