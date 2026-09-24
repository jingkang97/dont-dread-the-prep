import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowDown } from 'lucide-react'
import { BotCard, ThinkingCard } from '../components/food/BotCard'
import { MealPrep } from '../components/food/MealPrep'
import { SegmentedControl } from '../components/SegmentedControl'
import { Card } from '../components/ui'
import { useLang } from '../i18n/LanguageContext'
import { ApiError, getApiDish, postApiFoodChat, type ApiDishChoice } from '../lib/api'
import { loadFoodChat, saveFoodChat, type FoodChatAnswer, type FoodChatMsg } from '../lib/foodChat'
import { clearFoodChatUi, loadFoodChatUi, saveFoodChatUi } from '../lib/foodChatUi'
import { usePrimeLiveCopy } from '../i18n/liveCopy'
import { EN, type StringKey } from '../i18n/strings'
import type { PrepSession } from '../lib/session'
import { easeOut, fadeY } from '../lib/motion'
import { cn } from '../lib/cn'
import { isDemoMode, isDemoPlaying } from '../demo/enabled'
import { FOOD_ASK_EVENT, FOOD_INPUT_EVENT, foodDemoSlug } from '../demo/dom'

const CHAT_SUGGESTIONS: { key: StringKey; query: string }[] = [
  { key: 'food.suggest.chickenRice', query: 'Chicken rice' },
  { key: 'food.suggest.kopiMilk', query: 'Kopi with milk' },
  { key: 'food.suggest.appleJuice', query: 'Apple juice' },
  { key: 'food.suggest.milo', query: 'Milo' },
  { key: 'food.suggest.whiteBread', query: 'White bread' },
  { key: 'food.suggest.thosai', query: 'Thosai' },
  { key: 'food.suggest.ckt', query: 'Char kway teow' },
]

function scrollToLatestTurn(el: HTMLElement, behavior: ScrollBehavior) {
  const bots = el.querySelectorAll('[data-demo^="food-answer-"], [data-demo^="food-thinking-"]')
  const turn =
    el.querySelector('[data-food-bot-turn]') ??
    bots[bots.length - 1] ??
    el.querySelector('[data-food-turn]')
  if (!(turn instanceof HTMLElement)) {
    el.scrollTo({ top: el.scrollHeight, behavior })
    return
  }
  const top = turn.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop - 8
  el.scrollTo({ top: Math.max(0, top), behavior })
}

function userBubbleLabel(text: string | undefined, query: string | undefined, tx: (s: string) => string) {
  const source = (query || text || '').trim()
  if (!source) return ''
  if (query) return tx(query)
  if (/^[\x00-\x7F]+$/.test(source) && /[A-Za-z]/.test(source)) return tx(source)
  return source
}

function canJump(el: HTMLElement) {
  return el.scrollHeight - el.clientHeight >= 32
}

function animateScrollTop(el: HTMLElement, ms: number) {
  const from = el.scrollTop
  if (from <= 2) return () => {}
  const start = performance.now()
  let raf = 0
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / ms)
    const eased = 1 - (1 - t) ** 3
    el.scrollTop = from * (1 - eased)
    if (t < 1) raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(raf)
}

type Tab = 'mealPrep' | 'chat'

export function FoodChat({ session }: { session: PrepSession }) {
  const { t, tx } = useLang()
  const [tab, setTab] = useState<Tab>('mealPrep')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<FoodChatMsg[]>(() => loadFoodChat(session.id))
  const askRef = useRef<(shown: string, query?: string) => void>(() => {})
  useEffect(() => {
    if (!isDemoMode()) return
    const onInput = (event: Event) => {
      const next = (event as CustomEvent<{ value?: string }>).detail?.value
      if (typeof next === 'string') setInput(next)
    }
    const onAsk = (event: Event) => {
      const text = (event as CustomEvent<{ text?: string }>).detail?.text
      if (typeof text === 'string' && text.trim()) askRef.current(text)
    }
    window.addEventListener(FOOD_INPUT_EVENT, onInput)
    window.addEventListener(FOOD_ASK_EVENT, onAsk)
    return () => {
      window.removeEventListener(FOOD_INPUT_EVENT, onInput)
      window.removeEventListener(FOOD_ASK_EVENT, onAsk)
    }
  }, [])
  usePrimeLiveCopy(
    messages.flatMap((msg) =>
      [msg.query, msg.text, msg.answer?.message, ...(msg.answer?.choices ?? []).map((c) => c.name)].filter(
        (text): text is string => Boolean(text),
      ),
    ),
  )
  const listRef = useRef<HTMLDivElement>(null)
  const skipEnter = useRef(messages.length > 0)
  const prevLen = useRef(messages.length)
  const [showJump, setShowJump] = useState(false)
  const [clearing, setClearing] = useState(false)
  const clearingRef = useRef(false)
  const clearAnim = useRef<() => void>(() => {})

  useLayoutEffect(() => {
    saveFoodChat(session.id, messages)
  }, [session.id, messages])

  useLayoutEffect(() => {
    const el = listRef.current
    if (!el) return

    const measure = () => setShowJump(canJump(el))

    const added = messages.length > prevLen.current
    const cleared = prevLen.current > 0 && messages.length === 0
    prevLen.current = messages.length

    const alignTurn = (behavior: ScrollBehavior) => {
      scrollToLatestTurn(el, behavior)
      saveFoodChatUi(session.id, { listTop: el.scrollTop, landed: true })
      measure()
    }

    if (added) {
      skipEnter.current = false
    } else if (cleared) {
      skipEnter.current = true
      saveFoodChatUi(session.id, { listTop: 0, landed: true })
      measure()
    } else if (isDemoPlaying()) {
      /* keep current scroll; align to the latest bot reply below */
    } else if (!clearingRef.current) {
      const saved = loadFoodChatUi(session.id)
      if (saved?.landed) {
        el.scrollTo({ top: saved.listTop, behavior: 'auto' })
        measure()
      } else {
        el.scrollTo({ top: 0, behavior: 'auto' })
        saveFoodChatUi(session.id, { listTop: 0, landed: true })
        measure()
      }
    }

    const pinLatest = added || isDemoPlaying()
    const frames = pinLatest
      ? [requestAnimationFrame(() => requestAnimationFrame(() => alignTurn(isDemoPlaying() ? 'auto' : 'smooth')))]
      : [requestAnimationFrame(measure)]

    const onScroll = () => {
      if (!clearingRef.current) saveFoodChatUi(session.id, { listTop: el.scrollTop, landed: true })
      measure()
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      frames.forEach((id) => cancelAnimationFrame(id))
      el.removeEventListener('scroll', onScroll)
    }
  }, [session.id, messages])

  async function ask(shown: string, query?: string) {
    const text = shown.trim()
    if (!text) return
    const queryText = (query ?? shown).trim()
    const pendingId = crypto.randomUUID()
    setMessages((m) => [
      ...m,
      { id: crypto.randomUUID(), role: 'user', text, query: query ? queryText : undefined },
      { id: pendingId, role: 'bot', pending: true, query: queryText },
    ])
    setInput('')

    let answer: FoodChatAnswer
    try {
      const res = await postApiFoodChat(queryText, session.hospitalId)
      answer = {
        status: res.status,
        message: res.message,
        matchedQuery: res.matched_query,
        matchedSource: res.matched_source,
        dish: res.dish,
        choices: res.choices,
      }
    } catch (err) {
      answer = {
        status: 'not_configured',
        message: err instanceof ApiError ? err.detail : EN['food.networkError'],
      }
    }

    setMessages((m) =>
      m.map((msg) => (msg.id === pendingId ? { ...msg, pending: false, answer } : msg)),
    )
  }
  askRef.current = ask

  async function selectChoice(choice: ApiDishChoice) {
    const pendingId = crypto.randomUUID()
    setMessages((m) => [
      ...m,
      { id: crypto.randomUUID(), role: 'user', text: choice.name, query: choice.name },
      { id: pendingId, role: 'bot', pending: true, query: choice.name },
    ])

    let answer: FoodChatAnswer
    try {
      const dish = await getApiDish(choice.id)
      answer = {
        status: 'ok',
        matchedQuery: dish.name,
        matchedSource: dish.source_hospital,
        dish,
      }
    } catch (err) {
      answer = {
        status: 'not_configured',
        message: err instanceof ApiError ? err.detail : EN['food.networkError'],
      }
    }

    setMessages((m) =>
      m.map((msg) => (msg.id === pendingId ? { ...msg, pending: false, answer } : msg)),
    )
  }

  const lastUserId = messages.filter((m) => m.role === 'user').at(-1)?.id
  const lastBotId = messages.filter((m) => m.role === 'bot').at(-1)?.id

  function jumpTo(top: number) {
    listRef.current?.scrollTo({ top, behavior: 'smooth' })
  }

  function finishClear() {
    clearAnim.current()
    clearingRef.current = false
    skipEnter.current = true
    setMessages([])
    setClearing(false)
    clearFoodChatUi()
    saveFoodChatUi(session.id, { listTop: 0, landed: true })
  }

  function clearChat() {
    if (clearingRef.current || messages.length === 0) return
    const el = listRef.current
    const from = el?.scrollTop ?? 0
    const ms = Math.round(Math.min(420, Math.max(280, from * 0.35)))
    clearingRef.current = true
    setClearing(true)
    if (el && from > 2) clearAnim.current = animateScrollTop(el, ms)
    window.setTimeout(finishClear, ms)
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="px-5 pt-3">
        <SegmentedControl
          value={tab}
          onChange={setTab}
          className="h-11 w-full rounded-xl"
          buttonClassName="px-3 text-[15px]"
          options={[
            { id: 'mealPrep', label: t('food.tabMealPrep') },
            { id: 'chat', label: t('food.tabChat') },
          ]}
        />
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          aria-hidden={tab !== 'mealPrep'}
          className={cn('absolute inset-0', tab !== 'mealPrep' && 'invisible pointer-events-none')}
        >
          <MealPrep session={session} />
        </div>

        <div
          aria-hidden={tab !== 'chat'}
          className={cn('absolute inset-0 flex min-h-0 flex-col', tab !== 'chat' && 'invisible pointer-events-none')}
        >
          {messages.length > 0 && !clearing ? (
            <div className="flex shrink-0 justify-end px-5 pt-2">
              <button
                type="button"
                data-demo="food-clear"
                onClick={clearChat}
                className="rounded-full border border-line bg-paper-2 px-2.5 py-1 text-[12px] font-semibold text-teal-deep"
              >
                {t('food.clear')}
              </button>
            </div>
          ) : null}
          <div className="relative min-h-0 flex-1">
            <div
              ref={listRef}
              data-food-scroll
              className={cn(
                'h-full min-h-0 space-y-3 overflow-y-auto overflow-anchor-none overscroll-y-contain px-5 pb-4',
                messages.length > 0 && !clearing ? 'pt-2' : 'pt-4',
              )}
            >
              <Card className="p-3.5">
                <p className="text-[16px] font-semibold text-ink">
                  {t('food.introTitle', { hospital: tx(session.hospitalShort) })}
                </p>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                  {t('food.introBody')}
                </p>
              </Card>
              {messages.length > 0 && (
                <motion.div
                  initial={false}
                  animate={{ opacity: clearing ? 0 : 1 }}
                  transition={{ duration: 0.32, ease: easeOut }}
                  className="grid gap-3"
                >
                  {messages.map((msg) =>
                    msg.role === 'user' ? (
                      <motion.div
                        key={msg.id}
                        data-food-turn={msg.id === lastUserId ? '' : undefined}
                        className="flex justify-end"
                        {...(skipEnter.current ? {} : fadeY)}
                      >
                        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-navy px-3.5 py-2.5 text-[14px] text-white">
                          {userBubbleLabel(msg.text, msg.query, tx)}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key={msg.id}
                        data-demo={
                          msg.pending || !msg.answer
                            ? `food-thinking-${foodDemoSlug(msg.query ?? '')}`
                            : `food-answer-${foodDemoSlug(msg.query ?? '')}`
                        }
                        data-demo-food-id={msg.id}
                        data-demo-food-q={msg.query ?? ''}
                        data-food-bot-turn={msg.id === lastBotId ? '' : undefined}
                        {...(skipEnter.current ? {} : fadeY)}
                      >
                        {msg.pending || !msg.answer ? (
                          <ThinkingCard />
                        ) : (
                          <BotCard answer={msg.answer} onSelectChoice={selectChoice} />
                        )}
                      </motion.div>
                    ),
                  )}
                </motion.div>
              )}
            </div>
            {showJump && (
              <div className="pointer-events-none absolute bottom-3 right-4 z-10">
                <div className="pointer-events-auto">
                  <FoodJumpFabs
                    onUp={() => jumpTo(0)}
                    onDown={() => jumpTo(listRef.current?.scrollHeight ?? 0)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-line bg-paper-2 px-4 pb-2.5 pt-2.5">
            <div className="mb-2 flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {CHAT_SUGGESTIONS.map((item) => (
                <button
                  key={item.query}
                  type="button"
                  data-demo={`food-suggest-${item.query}`}
                  onClick={() => ask(t(item.key), item.query)}
                  className="shrink-0 rounded-full border border-line bg-paper px-3 py-1.5 text-[12px] font-medium text-navy"
                >
                  {t(item.key)}
                </button>
              ))}
            </div>
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                ask(input)
              }}
            >
              <input
                data-demo="food-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('food.placeholder')}
                className="h-10 min-w-0 flex-1 rounded-full border border-line bg-paper px-3.5 text-[16px] outline-none focus:border-navy"
              />
              <button
                type="submit"
                data-demo="food-send"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-teal text-white"
                aria-label={t('food.send')}
              >
                <SendGlyph />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

function SendGlyph() {
  return (
    <svg
      viewBox="0.9 -1.2 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="block"
    >
      <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
      <path d="m21.854 2.147-10.94 10.939" />
    </svg>
  )
}

function FoodJumpFabs({ onUp, onDown }: { onUp: () => void; onDown: () => void }) {
  const { t } = useLang()
  return (
    <div className="flex flex-col gap-1.5">
      <JumpCircle label={t('food.jumpTop')} up onClick={onUp} />
      <JumpCircle label={t('food.jumpLatest')} up={false} onClick={onDown} />
    </div>
  )
}

function JumpCircle({ label, up, onClick }: { label: string; up: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-[0_3px_12px_rgba(28,28,30,0.14)]"
    >
      <ArrowDown size={16} strokeWidth={2.6} className={`text-teal-deep ${up ? 'rotate-180' : ''}`} />
    </button>
  )
}
