import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { stopHomeTour } from '../lib/homeTour'
import type { Screen } from '../lib/session'
import { queryVisible, scrollIntoView, setHospitalQuery, setNativeValue } from './dom'
import { isDemoMode, setDemoPlaying } from './enabled'
import { buildDemoScript, DEMO_ONBOARDING_COUNT, demoStepInfo, type DemoStepInfo } from './script'
import { DemoAbort, type DemoCtx } from './types'

export type DemoStatus = 'idle' | 'playing' | 'paused' | 'done'

type DemoApi = {
  enabled: boolean
  status: DemoStatus
  stepIndex: number
  stepCount: number
  stepLabel: string
  stepFeature: string
  steps: DemoStepInfo[]
  speed: number
  setSpeed: (n: number) => void
  target: HTMLElement | null
  play: () => void
  pause: () => void
  stop: () => void
  restart: () => void
  loop: boolean
  setLoop: (on: boolean) => void
  runNonce: number
}

const DemoContext = createContext<DemoApi | null>(null)

export function useDemo() {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error('useDemo outside provider')
  return ctx
}

export function DemoProvider({
  children,
  hasSession,
  setScreen,
  clear,
  resetLang,
}: {
  children: ReactNode
  hasSession: boolean
  setScreen: (screen: Screen) => void
  clear: () => void
  resetLang: () => void
}) {
  const enabled = isDemoMode()
  const stepsMeta = useMemo(() => demoStepInfo(), [])
  const [status, setStatus] = useState<DemoStatus>('idle')
  const [stepIndex, setStepIndex] = useState(0)
  const [stepCount, setStepCount] = useState(stepsMeta.length)
  const [stepLabel, setStepLabel] = useState(stepsMeta[0]?.label ?? 'Ready')
  const [stepFeature, setStepFeature] = useState(stepsMeta[0]?.feature ?? '')
  const [speed, setSpeed] = useState(1)
  const [loop, setLoop] = useState(false)
  const [runNonce, setRunNonce] = useState(0)
  const [target, setTarget] = useState<HTMLElement | null>(null)

  const statusRef = useRef(status)
  const speedRef = useRef(speed)
  const loopRef = useRef(loop)
  const hasSessionRef = useRef(hasSession)
  const abortRef = useRef<AbortController | null>(null)
  const runId = useRef(0)
  statusRef.current = status
  speedRef.current = speed
  loopRef.current = loop
  hasSessionRef.current = hasSession

  const finish = useCallback((next: DemoStatus) => {
    abortRef.current?.abort()
    abortRef.current = null
    setDemoPlaying(false)
    setTarget(null)
    setStatus(next)
    if (next === 'idle') {
      setStepIndex(0)
      setStepLabel(stepsMeta[0]?.label ?? 'Ready')
      setStepFeature(stepsMeta[0]?.feature ?? '')
    }
  }, [stepsMeta])

  const makeCtx = useCallback(
    (signal: AbortSignal): DemoCtx => {
      const check = () => {
        if (signal.aborted) throw new DemoAbort()
      }

      const wait = async (ms: number, paced = true) => {
        const total = paced ? Math.max(16, ms / speedRef.current) : ms
        const startAt = performance.now()
        while (performance.now() - startAt < total) {
          check()
          while (statusRef.current === 'paused') {
            check()
            await sleep(50)
          }
          await sleep(16)
        }
      }

      const query = (selector: string) => queryVisible(selector)

      const waitFor = async (selector: string, timeoutMs = 15000) => {
        const deadline = performance.now() + timeoutMs
        while (performance.now() < deadline) {
          check()
          while (statusRef.current === 'paused') {
            check()
            await sleep(50)
          }
          const el = query(selector)
          if (el) {
            await sleep(60)
            const still = query(selector)
            if (still) return still
          }
          await sleep(80)
        }
        const last = query(selector)
        if (last) return last
        throw new Error(`Demo: missing ${selector}`)
      }

      const waitForGone = async (selector: string, timeoutMs = 15000) => {
        const deadline = performance.now() + timeoutMs
        while (performance.now() < deadline) {
          check()
          while (statusRef.current === 'paused') {
            check()
            await sleep(50)
          }
          if (!query(selector)) {
            await sleep(80)
            if (!query(selector)) return
          }
          await sleep(80)
        }
        if (query(selector)) throw new Error(`Demo: still on screen ${selector}`)
      }

      const highlight = (el: HTMLElement | null) => {
        setTarget(el)
        if (el) scrollIntoView(el)
      }

      const show: DemoCtx['show'] = async (selector, dwellMs = 1200) => {
        const el = await waitFor(selector)
        highlight(el)
        await wait(280, false)
        await wait(dwellMs, true)
      }

      const tap: DemoCtx['tap'] = async (selector) => {
        const el = typeof selector === 'string' ? await waitFor(selector) : selector
        highlight(el)
        await wait(380, true)
        el.click()
        await wait(320, false)
      }

      const maybeTap: DemoCtx['maybeTap'] = async (selector) => {
        const el = query(selector)
        if (!el) return false
        await tap(el)
        return true
      }

      return {
        go: setScreen,
        reset: clear,
        wait,
        waitFor,
        waitForGone,
        query,
        highlight,
        show,
        tap,
        maybeTap,
        type: async (el, text) => {
          highlight(el)
          el.focus()
          let value = el.value
          for (const ch of text) {
            check()
            value += ch
            setNativeValue(el, value)
            if (el.getAttribute('data-demo') === 'on-hospital-search') setHospitalQuery(value)
            await wait(70)
          }
        },
        clearInput: (el) => {
          setNativeValue(el, '')
          if (el.getAttribute('data-demo') === 'on-hospital-search') setHospitalQuery('')
        },
      }
    },
    [clear, setScreen],
  )

  const start = useCallback(
    async (fromIndex = 0) => {
      abortRef.current?.abort()
      const abort = new AbortController()
      abortRef.current = abort
      const id = ++runId.current
      stopHomeTour()
      setDemoPlaying(true)
      setTarget(null)
      setStatus('playing')
      setRunNonce((n) => n + 1)
      setStepIndex(fromIndex)
      setStepLabel(stepsMeta[fromIndex]?.label ?? 'Ready')
      setStepFeature(stepsMeta[fromIndex]?.feature ?? '')
      resetLang()

      const steps = buildDemoScript()
      const startAt = Math.max(0, Math.min(fromIndex, steps.length - 1))
      const mustOnboard = startAt < DEMO_ONBOARDING_COUNT || !hasSessionRef.current
      if (mustOnboard) {
        clear()
        await sleep(350)
      } else {
        await sleep(80)
      }
      if (runId.current !== id) return

      setStepCount(steps.length)
      const ctx = makeCtx(abort.signal)
      let i = mustOnboard && startAt >= DEMO_ONBOARDING_COUNT ? 0 : startAt

      try {
        while (i < steps.length) {
          if (runId.current !== id) return
          setStepIndex(i)
          setStepLabel(steps[i].label)
          setStepFeature(steps[i].feature)
          try {
            let lastErr: unknown
            for (let attempt = 0; attempt < 3; attempt++) {
              try {
                await steps[i].run(ctx)
                lastErr = null
                break
              } catch (err) {
                if (err instanceof DemoAbort) throw err
                lastErr = err
                console.warn(`Demo step failed (${attempt + 1}/3): ${steps[i].id}`, err)
                await sleep(500)
              }
            }
            if (lastErr) throw lastErr
          } catch (err) {
            if (err instanceof DemoAbort) throw err
            console.warn(`Demo step skipped after retries: ${steps[i].id}`, err)
          }
          if (runId.current !== id) return
          while (statusRef.current === 'paused') {
            if (runId.current !== id || abort.signal.aborted) throw new DemoAbort()
            await sleep(50)
          }
          i += 1
        }
        if (runId.current !== id) return
        if (loopRef.current) {
          setStepLabel('Looping')
          setStepFeature('')
          await sleep(900)
          if (runId.current !== id || abort.signal.aborted) return
          void start(0)
          return
        }
        setStepIndex(steps.length)
        setStepLabel('Done')
        setStepFeature('')
        finish('done')
      } catch (err) {
        if (err instanceof DemoAbort) return
        console.warn(err)
        finish('idle')
      }
    },
    [clear, finish, makeCtx, resetLang],
  )

  const play = useCallback(() => {
    if (statusRef.current === 'paused') {
      setStatus('playing')
      setDemoPlaying(true)
      return
    }
    void start(0)
  }, [start])

  const pause = useCallback(() => {
    if (statusRef.current !== 'playing') return
    setStatus('paused')
  }, [])

  const stop = useCallback(() => {
    runId.current += 1
    stopHomeTour()
    setHospitalQuery('')
    resetLang()
    clear()
    setRunNonce((n) => n + 1)
    finish('idle')
  }, [clear, finish, resetLang])

  const restart = useCallback(() => {
    void start(0)
  }, [start])

  const value = useMemo<DemoApi>(
    () => ({
      enabled,
      status,
      stepIndex,
      stepCount,
      stepLabel,
      stepFeature,
      steps: stepsMeta,
      speed,
      setSpeed,
      target,
      play,
      pause,
      stop,
      restart,
      loop,
      setLoop,
      runNonce,
    }),
    [enabled, loop, pause, play, restart, runNonce, speed, status, stepCount, stepFeature, stepIndex, stepLabel, stepsMeta, stop, target],
  )

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}
