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

export const HOSPITAL_QUERY_EVENT = 'preppath-demo-hospital-query'
export const FOOD_INPUT_EVENT = 'preppath-demo-food-input'
export const FOOD_ASK_EVENT = 'preppath-demo-food-ask'

export function setHospitalQuery(query: string) {
  window.dispatchEvent(new CustomEvent(HOSPITAL_QUERY_EVENT, { detail: { query } }))
}

export function setFoodInput(value: string) {
  window.dispatchEvent(new CustomEvent(FOOD_INPUT_EVENT, { detail: { value } }))
}

export function askFoodDemo(text: string) {
  window.dispatchEvent(new CustomEvent(FOOD_ASK_EVENT, { detail: { text } }))
}

export function foodDemoSlug(query: string) {
  return query.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'unknown'
}

export function scrollIntoView(el: HTMLElement) {
  const xScroll = el.closest<HTMLElement>('.overflow-x-auto')
  if (xScroll) {
    const row = xScroll.getBoundingClientRect()
    const box = el.getBoundingClientRect()
    const delta = box.left - row.left - (row.width - box.width) / 2
    xScroll.scrollTo({ left: Math.max(0, xScroll.scrollLeft + delta), behavior: 'auto' })
  }
  const food = el.closest<HTMLElement>('[data-food-scroll]')
  if (food) {
    const top = el.getBoundingClientRect().top - food.getBoundingClientRect().top + food.scrollTop - 16
    food.scrollTo({
      top: Math.max(0, Math.min(top, food.scrollHeight - food.clientHeight)),
      behavior: 'auto',
    })
    return
  }
  el.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'nearest' })
  const scroller = el.closest<HTMLElement>('[data-tl-scroll], [data-home-scroll], .overflow-y-auto')
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
