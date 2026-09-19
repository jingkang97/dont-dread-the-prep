import type { Screen } from '../lib/session'

export class DemoAbort extends Error {
  constructor() {
    super('demo-abort')
    this.name = 'DemoAbort'
  }
}

export type DemoCtx = {
  go: (screen: Screen) => void
  reset: () => void
  wait: (ms: number, paced?: boolean) => Promise<void>
  waitFor: (selector: string, timeoutMs?: number) => Promise<HTMLElement>
  waitForGone: (selector: string, timeoutMs?: number) => Promise<void>
  query: (selector: string) => HTMLElement | null
  highlight: (el: HTMLElement | null) => void
  show: (selector: string, dwellMs?: number) => Promise<void>
  tap: (selector: string | HTMLElement) => Promise<void>
  maybeTap: (selector: string) => Promise<boolean>
  type: (el: HTMLInputElement, text: string) => Promise<void>
  clearInput: (el: HTMLInputElement) => void
}
