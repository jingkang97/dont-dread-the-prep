import {
  askFoodDemo,
  foodDemoSlug,
  isUsable,
  queryVisible,
  scrollIntoView,
  setFoodInput,
  setHospitalQuery,
} from './dom'
import type { DemoCtx } from './types'
import { EN } from '../i18n/strings'
import { plusDays } from '../lib/dates'
import { startHomeTour, waitForTourTargets } from '../lib/homeTour'

export type DemoStep = {
  id: string
  label: string
  feature: string
  run: (ctx: DemoCtx) => Promise<void>
}

const HOSPITALS = ['sgh', 'skh', 'ttsh', 'nccs']
const LANGS_DEMO = ['zh', 'ms', 'ta', 'en'] as const

async function ensureOnboarding(ctx: DemoCtx) {
  if (queryVisible('[data-demo="on-lang"]')) return
  ctx.reset()
  await ctx.wait(400)
  await ctx.waitFor('[data-demo="on-lang"]', 8000)
}

async function ensureHospitalList(ctx: DemoCtx) {
  await ensureOnboarding(ctx)
  if (queryVisible('[data-demo-hospital-row]')) return
  if (queryVisible('[data-demo="on-confirm"]')) {
    await ctx.maybeTap('[data-demo="on-back"]')
    await ctx.wait(400)
  }
  if (queryVisible('[data-demo="on-schedule"]')) {
    await ctx.maybeTap('[data-demo="on-back"]')
  }
  await ctx.waitFor('[data-demo-hospital-row]', 12000)
}

async function waitLangIdle(ctx: DemoCtx) {
  await ctx.wait(200)
  for (let i = 0; i < 80; i++) {
    if (!document.querySelector('[aria-busy="true"]')) break
    await ctx.wait(120)
  }
  await ctx.wait(500)
}

async function typeHospitalSearch(ctx: DemoCtx, text: string) {
  const el = await ctx.waitFor('[data-demo="on-hospital-search"]')
  ctx.highlight(el)
  if (el instanceof HTMLInputElement) el.focus()
  setHospitalQuery('')
  await ctx.wait(200)
  let value = ''
  for (const ch of text) {
    value += ch
    setHospitalQuery(value)
    await ctx.wait(110)
  }
}

async function cycleChipLangs(ctx: DemoCtx) {
  await ctx.show('[data-demo="on-lang"]', 900)
  for (const id of LANGS_DEMO) {
    await ctx.tap(`[data-demo="lang-${id}"]`)
    await waitLangIdle(ctx)
    await ctx.wait(700)
  }
}

async function cycleHomeLangs(ctx: DemoCtx) {
  await ctx.waitFor('[data-demo="lang-menu"]')
  await ctx.show('[data-demo="lang-menu"]', 700)
  for (const id of LANGS_DEMO) {
    await ctx.tap('[data-demo="lang-menu"]')
    await ctx.waitFor(`[data-demo="lang-menu-${id}"]`)
    await ctx.tap(`[data-demo="lang-menu-${id}"]`)
    await waitLangIdle(ctx)
    await ctx.wait(700)
  }
}

function queryTourNext() {
  const el = document.querySelector('.driver-popover-next-btn')
  return el instanceof HTMLElement ? el : null
}

async function waitTourNext(ctx: DemoCtx) {
  for (let i = 0; i < 60; i++) {
    const el = queryTourNext()
    if (el && el.getBoundingClientRect().width > 2) return el
    await ctx.wait(80)
  }
  throw new Error('Demo: tour next missing')
}

async function runHomeTour(ctx: DemoCtx) {
  ctx.go('home')
  await ctx.wait(400)
  await waitForTourTargets(8000)
  const btn = await ctx.waitFor('[data-demo="home-tour"]', 10000)
  ctx.highlight(btn)
  await ctx.wait(1100)
  await ctx.tap(btn)
  ctx.highlight(null)
  try {
    await waitTourNext(ctx)
  } catch {
    startHomeTour({ t: (key) => EN[key] })
    await waitTourNext(ctx)
  }
  for (let i = 0; i < 8; i++) {
    const btnNext = queryTourNext() ?? (await waitTourNext(ctx).catch(() => null))
    if (!btnNext) break
    await ctx.wait(1700)
    btnNext.click()
    const again = await waitTourNext(ctx).catch(() => null)
    if (!again) break
  }
  await ctx.wait(600)
}

async function runHomeEdit(ctx: DemoCtx) {
  ctx.go('home')
  await ctx.waitFor('[data-demo="home-edit"]')
  await ctx.show('[data-demo="home-edit"]', 900)
  await ctx.tap('[data-demo="home-edit"]')
  await ctx.waitFor('[data-demo="edit-chooser"]')
  await ctx.show('[data-demo="edit-chooser"]', 1400)
  await ctx.show('[data-demo="edit-date"]', 700)
  await ctx.tap('[data-demo="edit-date"]')
  await ctx.waitFor('[data-demo="on-schedule"]')
  await ctx.show('[data-demo="on-date"]', 900)
  await tapCalendarDay(ctx, plusDays(7))
  await ctx.wait(700)
  await ctx.show('[data-demo-seg="am"]', 500)
  await ctx.tap('[data-demo-seg="am"]')
  await ctx.wait(800)
  await ctx.show('[data-demo="on-report"]', 700)
  const time = queryVisible('[data-demo="on-report"] button[role="option"]:not([aria-selected="true"])')
  if (time) await ctx.tap(time)
  await ctx.wait(800)
  await ctx.tap('[data-demo="edit-save"]')
  await ctx.waitForGone('[data-demo="edit-save"]', 20000)
  await ctx.waitForGone('[data-demo="edit-chooser"]', 8000)
  await ctx.waitFor('[data-tour="session-bar"]', 20000)
  await ctx.wait(800)
}

async function tapCalendarDay(ctx: DemoCtx, ymd: string) {
  let day = queryVisible(`[data-demo="cal-${ymd}"]`)
  if (!day) {
    await ctx.maybeTap('.rdp-button_next, button[name="next-month"]')
    await ctx.wait(400)
    day = queryVisible(`[data-demo="cal-${ymd}"]`)
  }
  if (day) await ctx.tap(day)
}

async function pickAppointment(ctx: DemoCtx) {
  await ctx.waitFor('[data-demo="on-schedule"]')
  await ctx.show('[data-demo="on-date"]', 1000)
  await tapCalendarDay(ctx, plusDays(7))
  await ctx.wait(800)
  await ctx.show('[data-demo-seg="pm"]', 600)
  await ctx.tap('[data-demo-seg="pm"]')
  await ctx.wait(900)
  await ctx.show('[data-demo="on-report"]', 800)
  const time = queryVisible('[data-demo="on-report"] button[role="option"]:not([aria-selected="true"])')
  if (time) await ctx.tap(time)
  await ctx.wait(900)
  await ctx.tap('[data-demo="on-continue"]')
}

async function openScreen(ctx: DemoCtx, screen: Parameters<DemoCtx['go']>[0], ready: string) {
  ctx.go(screen)
  await ctx.waitFor(ready, 15000)
  await ctx.wait(360, false)
}

async function openTimelineHelp(ctx: DemoCtx, selector: string) {
  ctx.go('timeline')
  const help = await ctx.waitFor(selector, 12000)
  help.scrollIntoView({ behavior: 'auto', block: 'center' })
  await ctx.wait(400)
  await ctx.tap(help)
  await ctx.waitFor('[data-demo="sheet-done"], [data-demo="sheet-dismiss"]', 8000)
  await ctx.wait(1800)
  await ctx.tap('[data-demo="sheet-done"], [data-demo="sheet-dismiss"]')
  await ctx.waitForGone('[data-demo="sheet-done"], [data-demo="sheet-dismiss"]')
  await ctx.wait(400)
}

function lastFoodBot() {
  const nodes = document.querySelectorAll('[data-food-scroll] [data-food-bot-turn]')
  const el = nodes[nodes.length - 1]
  return el instanceof HTMLElement ? el : null
}

function foodBotSlug(el: HTMLElement) {
  const demo = el.getAttribute('data-demo') || ''
  const prefix = demo.startsWith('food-answer-')
    ? 'food-answer-'
    : demo.startsWith('food-thinking-')
      ? 'food-thinking-'
      : ''
  return prefix ? demo.slice(prefix.length) : foodDemoSlug(el.getAttribute('data-demo-food-q') || '')
}

function scrollFoodReply(el: HTMLElement) {
  const list = el.closest<HTMLElement>('[data-food-scroll]')
  if (!list) return
  const top = el.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop - 12
  list.scrollTo({
    top: Math.max(0, Math.min(top, list.scrollHeight - list.clientHeight)),
    behavior: 'auto',
  })
}

async function waitForNewFoodAnswer(ctx: DemoCtx, expectQ: string, dwellMs: number, beforeId: string | null) {
  const wanted = foodDemoSlug(expectQ)
  const started = performance.now()
  let forced = false
  const deadline = started + 30000
  while (performance.now() < deadline) {
    const last = lastFoodBot()
    const lastId = last?.getAttribute('data-demo-food-id') ?? null
    const isNew = Boolean(last && lastId && lastId !== beforeId)
    const isThinking = Boolean(last && (last.getAttribute('data-demo') || '').startsWith('food-thinking-'))
    const isWanted = Boolean(last && isNew && foodBotSlug(last) === wanted)
    const isWantedAnswer = Boolean(
      isWanted && !isThinking && (last?.getAttribute('data-demo') || '').startsWith('food-answer-'),
    )
    if (!forced && performance.now() - started > 1000 && !isNew) {
      askFoodDemo(expectQ)
      forced = true
    }
    if (isWanted && last) {
      scrollFoodReply(last)
      ctx.highlight(last)
    }
    if (isWantedAnswer) {
      const slices = Math.max(6, Math.round(dwellMs / 220))
      for (let i = 0; i < slices; i++) {
        const live = lastFoodBot()
        if (live && foodBotSlug(live) === wanted) {
          scrollFoodReply(live)
          ctx.highlight(live)
        }
        await ctx.wait(i === 0 ? 200 : 220, i !== 0)
      }
      return
    }
    await ctx.wait(80, false)
  }
  throw new Error(`Demo: food reply missing for ${expectQ}`)
}

async function tapFoodAndShow(ctx: DemoCtx, selector: string, dwellMs: number, expectQ: string) {
  const beforeId = lastFoodBot()?.getAttribute('data-demo-food-id') ?? null
  await ctx.tap(selector)
  await waitForNewFoodAnswer(ctx, expectQ, dwellMs, beforeId)
}

async function clearFoodChatDemo(ctx: DemoCtx) {
  if (!queryVisible('[data-demo="food-clear"]')) return
  await ctx.maybeTap('[data-demo="food-clear"]')
  const deadline = performance.now() + 4000
  while (performance.now() < deadline) {
    if (!document.querySelector('[data-food-scroll] [data-food-bot-turn]')) return
    await ctx.wait(80, false)
  }
}

async function scrollTimeline(ctx: DemoCtx) {
  ctx.go('timeline')
  const scroller = await ctx.waitFor('[data-tl-scroll]', 12000)
  const max = Math.max(0, scroller.scrollHeight - scroller.clientHeight)
  if (max < 40) return
  const from = scroller.scrollTop
  const duration = 2800
  const start = performance.now()
  while (true) {
    const p = Math.min(1, (performance.now() - start) / duration)
    scroller.scrollTop = from + (max - from) * p
    if (p >= 1) break
    await ctx.wait(40)
  }
  await ctx.wait(600)
}

export function buildDemoScript(): DemoStep[] {
  return [
    {
      id: 'on-lang',
      feature: 'Choose hospital',
      label: 'Switch language',
      run: async (ctx) => {
        await ensureOnboarding(ctx)
        await cycleChipLangs(ctx)
      },
    },
    {
      id: 'on-hospital-search',
      feature: 'Choose hospital',
      label: 'Search hospital',
      run: async (ctx) => {
        await ensureHospitalList(ctx)
        await ctx.show('[data-demo="on-hospital-search"]', 800)
        await typeHospitalSearch(ctx, 'TTSH')
        await ctx.wait(500)
        let picked =
          queryVisible('[data-demo="hospital-ttsh"]') ??
          HOSPITALS.map((id) => queryVisible(`[data-demo="hospital-${id}"]`)).find(Boolean) ??
          queryVisible('[data-demo-hospital-row]')
        if (!picked) {
          setHospitalQuery('')
          await ctx.wait(300)
          picked = queryVisible('[data-demo-hospital-row]')
        }
        if (!picked) throw new Error('Demo: no hospital row')
        await ctx.tap(picked)
      },
    },
    {
      id: 'on-schedule',
      feature: 'Choose hospital',
      label: 'Pick appointment',
      run: (ctx) => pickAppointment(ctx),
    },
    {
      id: 'on-confirm',
      feature: 'Choose hospital',
      label: 'Build the plan',
      run: async (ctx) => {
        await ctx.waitFor('[data-demo="on-generate"]')
        await ctx.show('[data-demo="on-confirm"]', 1600)
        await ctx.tap('[data-demo="on-generate"]')
        await ctx.waitFor('[data-tour="session-bar"]', 20000)
        await ctx.wait(800)
      },
    },
    {
      id: 'home-tour',
      feature: 'Home',
      label: 'Home tour',
      run: (ctx) => runHomeTour(ctx),
    },
    {
      id: 'home-lang',
      feature: 'Home',
      label: 'Switch language',
      run: async (ctx) => {
        ctx.go('home')
        await ctx.waitFor('[data-tour="session-bar"]')
        await cycleHomeLangs(ctx)
      },
    },
    {
      id: 'home-edit',
      feature: 'Home',
      label: 'Edit appointment',
      run: (ctx) => runHomeEdit(ctx),
    },
    {
      id: 'home-reminders',
      feature: 'Home',
      label: 'Reminder times',
      run: async (ctx) => {
        await openScreen(ctx, 'home', '[data-demo="home-reminders-cta"]')
        await ctx.show('[data-tour="home-reminders"]', 1000)
        await ctx.tap('[data-demo="home-reminders-cta"]')
        await openScreen(ctx, 'reminders', '[data-demo="reminders-intro"]')
        await ctx.show('[data-demo="reminders-intro"]', 4200)
        await ctx.show('[data-demo="reminders-options"]', 3200)
        await ctx.waitFor('[data-demo="reminders-plan"]', 15000)
        if (!queryVisible('[data-demo="reminders-plan"] li')) {
          await ctx.wait(800)
        }
        await ctx.waitFor('[data-demo="reminders-plan"] li', 15000).catch(() => null)
        await ctx.show('[data-demo="reminders-plan"]', 3600)
        await ctx.tap('[data-demo="reminders-back"]')
        await openScreen(ctx, 'home', '[data-demo="home-reminders-cta"]')
      },
    },
    {
      id: 'home-shortcut',
      feature: 'Home',
      label: 'Add to Home Screen',
      run: async (ctx) => {
        await openScreen(ctx, 'home', '[data-tour="home-shortcut"]')
        await ctx.show('[data-tour="home-shortcut"]', 1000)
        await ctx.tap('[data-demo="home-shortcut-ios"]')
        await ctx.waitFor('[data-demo="sheet-done"]')
        await ctx.show('[data-demo-seg="ios"]', 900)
        await ctx.tap('[data-demo-seg="android"]')
        await ctx.wait(1400)
        await ctx.tap('[data-demo="sheet-done"]')
        await ctx.waitForGone('[data-demo="sheet-done"]')
        await ctx.wait(400)
      },
    },
    {
      id: 'timeline',
      feature: 'Timeline',
      label: 'Prep timeline',
      run: async (ctx) => {
        await ctx.tap('[data-demo="nav-timeline"]')
        await openScreen(ctx, 'timeline', '[data-tl-card]')
        await ctx.show('[data-tl-card]', 1400)
      },
    },
    {
      id: 'timeline-scroll',
      feature: 'Timeline',
      label: 'Scroll the list',
      run: (ctx) => scrollTimeline(ctx),
    },
    {
      id: 'timeline-next',
      feature: 'Timeline',
      label: 'Jump to next',
      run: async (ctx) => {
        ctx.go('timeline')
        const fab = await ctx.waitFor('[data-demo="tl-fab"]', 12000)
        await ctx.show('[data-demo="tl-fab"]', 900)
        await ctx.tap(fab)
        await ctx.wait(1200)
      },
    },
    {
      id: 'timeline-med',
      feature: 'Timeline',
      label: 'Medication help',
      run: (ctx) => openTimelineHelp(ctx, '[data-demo="tl-help-med"]'),
    },
    {
      id: 'timeline-picoprep',
      feature: 'Timeline',
      label: 'Picoprep help',
      run: (ctx) => openTimelineHelp(ctx, '[data-demo="tl-help-picoprep"]'),
    },
    {
      id: 'timeline-cal',
      feature: 'Timeline',
      label: 'Calendar',
      run: async (ctx) => {
        ctx.go('timeline')
        await ctx.waitFor('[data-tl-card]')
        await ctx.show('[data-demo-seg="calendar"]', 700)
        await ctx.tap('[data-demo-seg="calendar"]')
        await ctx.waitFor('.pp-cal')
        await ctx.show('.pp-cal', 1000)
        const days = [...document.querySelectorAll('.pp-has-event:not(.rdp-selected) .rdp-day_button')].filter(
          (el): el is HTMLElement => isUsable(el),
        )
        for (const day of days.slice(0, 3)) {
          await ctx.tap(day)
          await ctx.wait(1100)
        }
        await ctx.wait(600)
      },
    },
    {
      id: 'food-meals',
      feature: 'Food',
      label: 'Meal ideas',
      run: async (ctx) => {
        await ctx.tap('[data-demo="nav-food"]')
        await openScreen(ctx, 'food', '[data-demo="food-meal-lunch"], [data-demo-seg="mealPrep"]')
        await ctx.maybeTap('[data-demo-seg="mealPrep"]')
        await ctx.waitFor('[data-demo="food-meal-lunch"]')
        await ctx.wait(700)
        await ctx.tap('[data-demo="food-meal-lunch"]')
        await ctx.wait(500)
        const cuisineChips = ['chinese', 'indian', 'western', 'japanese'] as const
        for (const id of cuisineChips) {
          const chip = document.querySelector(`[data-demo="food-cuisine-${id}"]`)
          if (!(chip instanceof HTMLElement)) continue
          scrollIntoView(chip)
          await ctx.wait(180, false)
          await ctx.tap(chip)
          await ctx.wait(700)
        }
        const all = document.querySelector('[data-demo="food-cuisine-all"]')
        if (all instanceof HTMLElement) {
          scrollIntoView(all)
          await ctx.wait(120, false)
          await ctx.tap(all)
          await ctx.wait(500)
        }
        await ctx.waitFor('[data-demo="food-dish"]')
        const dishes = [...document.querySelectorAll('[data-demo="food-dish"]')]
          .filter(isUsable)
          .slice(0, 2)
        for (const dish of dishes) {
          ctx.highlight(dish)
          await ctx.wait(800, true)
          await ctx.tap(dish)
          await ctx.wait(1600)
        }
      },
    },
    {
      id: 'food-chat',
      feature: 'Food',
      label: 'Check a food',
      run: async (ctx) => {
        ctx.go('food')
        await ctx.maybeTap('[data-demo-seg="chat"]')
        await ctx.waitFor('[data-demo="food-suggest-Chicken rice"]')
        await clearFoodChatDemo(ctx)
        await tapFoodAndShow(ctx, '[data-demo="food-suggest-Chicken rice"]', 2000, 'Chicken rice')
        const ckt = queryVisible('[data-demo="food-suggest-Char kway teow"]')
        if (ckt) await tapFoodAndShow(ctx, '[data-demo="food-suggest-Char kway teow"]', 1600, 'Char kway teow')
      },
    },
    {
      id: 'food-type',
      feature: 'Food',
      label: 'Type a food',
      run: async (ctx) => {
        ctx.go('food')
        await ctx.maybeTap('[data-demo-seg="chat"]')
        const field = await ctx.waitFor('[data-demo="food-input"]')
        if (!(field instanceof HTMLInputElement)) throw new Error('Demo: food input missing')
        ctx.clearInput(field)
        setFoodInput('apple juice')
        await ctx.type(field, 'apple juice')
        setFoodInput('apple juice')
        await ctx.wait(400, false)
        const send = await ctx.waitFor('[data-demo="food-send"]')
        ctx.highlight(send)
        await ctx.wait(350, false)
        const beforeId = lastFoodBot()?.getAttribute('data-demo-food-id') ?? null
        askFoodDemo('apple juice')
        await waitForNewFoodAnswer(ctx, 'apple juice', 2800, beforeId)
      },
    },
    {
      id: 'stool',
      feature: 'Stool guide',
      label: 'Stool chart',
      run: async (ctx) => {
        await ctx.tap('[data-demo="nav-stool"]')
        await openScreen(ctx, 'stool', '[data-demo="stool-chart"]')
        await ctx.wait(1000)
        await ctx.show('[data-demo="stool-chart"]', 1600)
        await ctx.maybeTap('[data-demo-seg="photos"]')
        await ctx.wait(1400)
        await ctx.maybeTap('[data-demo-seg="cartoon"]')
        await ctx.wait(800)
      },
    },
    {
      id: 'contacts',
      feature: 'Contacts',
      label: 'Hospital contacts',
      run: async (ctx) => {
        await ctx.tap('[data-demo="nav-contacts"]')
        await openScreen(ctx, 'contacts', '[data-demo="contacts"]')
        await ctx.show('[data-demo="contacts"]', 2000)
      },
    },
  ]
}

export type DemoStepInfo = Pick<DemoStep, 'id' | 'label' | 'feature'>

export const DEMO_ONBOARDING_COUNT = 4

export function demoStepInfo(): DemoStepInfo[] {
  return buildDemoScript().map(({ id, label, feature }) => ({ id, label, feature }))
}
