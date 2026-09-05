import { useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowDown, Send } from 'lucide-react'
import { classify, SUGGESTIONS, type ChatAnswer } from '../data/foods'
import { HOSPITALS } from '../data/hospitals'
import { Card, SectionLabel, SourceLine, VerdictPill } from '../components/ui'
import { useLang } from '../i18n/LanguageContext'
import type { StringKey } from '../i18n/strings'
import { loadFoodChat, saveFoodChat, type FoodChatMsg } from '../lib/foodChat'
import { clearFoodChatUi, loadFoodChatUi, saveFoodChatUi } from '../lib/foodChatUi'
import type { PrepSession } from '../lib/session'
import { easeOut, fadeY } from '../lib/motion'

function scrollToLatestTurn(el: HTMLElement, behavior: ScrollBehavior) {
  const turn = el.querySelector('[data-food-turn]')
  if (!(turn instanceof HTMLElement)) {
    el.scrollTo({ top: el.scrollHeight, behavior })
    return
  }
  const top = turn.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop - 8
  el.scrollTo({ top: Math.max(0, top), behavior })
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

export function FoodChat({ session }: { session: PrepSession }) {
  const { t } = useLang()
  const hospital = HOSPITALS[session.hospitalId]
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<FoodChatMsg[]>(() => loadFoodChat(session.id))
  const listRef = useRef<HTMLDivElement>(null)
  const skipEnter = useRef(messages.length > 0)
  const prevLen = useRef(messages.length)
  const [showJump, setShowJump] = useState(false)
  const [clearing, setClearing] = useState(false)
  const clearingRef = useRef(false)
  const clearAnim = useRef<() => void>(() => {})

  const intro: ChatAnswer = {
    verdict: 'ask',
    title: t('food.introTitle', { hospital: hospital.short }),
    body: t('food.introBody'),
    source: 'Doc 03 Low-residue ruleset — DRAFT, not dietitian-approved',
    rules: ['HOSP'],
    matched: 'intro',
  }

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
    } else if (!clearingRef.current) {
      const saved = loadFoodChatUi(session.id)
      if (saved?.landed) {
        el.scrollTo({ top: saved.listTop, behavior: 'auto' })
        measure()
      } else {
        alignTurn('auto')
      }
    }

    const frames = added
      ? [requestAnimationFrame(() => requestAnimationFrame(() => alignTurn('smooth')))]
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

  function ask(shown: string, query = shown, labelKey?: StringKey) {
    const text = shown.trim()
    if (!text) return
    const answer = classify(query.trim(), session.hospitalId)
    setMessages((m) => [
      ...m,
      { id: crypto.randomUUID(), role: 'user', text, labelKey },
      { id: crypto.randomUUID(), role: 'bot', answer },
    ])
    setInput('')
  }

  const lastUserId = messages.filter((m) => m.role === 'user').at(-1)?.id

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
      <div className="px-5 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <SectionLabel>{t('food.kicker')}</SectionLabel>
            <h1 className="font-display mt-1 text-[28px] leading-tight text-navy">{t('food.title')}</h1>
          </div>
          {messages.length > 0 && !clearing && (
            <button
              type="button"
              onClick={clearChat}
              className="mt-7 shrink-0 text-[13px] font-semibold text-teal-deep"
            >
              {t('food.clear')}
            </button>
          )}
        </div>
        <p className="mt-1 text-[13px] text-ink-soft">{t('food.lead', { hospital: hospital.short })}</p>
      </div>

      <div className="relative min-h-0 flex-1">
        <div ref={listRef} className="h-full min-h-0 space-y-3 overflow-y-auto overflow-anchor-none overscroll-y-contain px-5 py-4">
          <BotCard answer={intro} />
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
                        {msg.labelKey ? t(msg.labelKey) : msg.text}
                      </div>
                    </motion.div>
                  ) : (
                    msg.answer && (
                      <motion.div key={msg.id} {...(skipEnter.current ? {} : fadeY)}>
                        <BotCard answer={msg.answer} />
                      </motion.div>
                    )
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

      <div className="shrink-0 border-t border-line bg-paper-2 px-4 pb-3 pt-3">
        <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => ask(t(s.label), s.query, s.label)}
              className="shrink-0 rounded-full border border-line bg-paper px-3 py-1.5 text-[12px] font-medium text-navy"
            >
              {t(s.label)}
            </button>
          ))}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            ask(input)
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('food.placeholder')}
            className="flex-1 rounded-2xl border border-line bg-paper px-3.5 py-3 text-[15px] outline-none focus:border-navy"
          />
          <button
            type="submit"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-teal text-white"
            aria-label={t('food.send')}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
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

function BotCard({ answer }: { answer: ChatAnswer }) {
  const { t } = useLang()
  const title = answer.titleKey ? t(answer.titleKey, answer.bodyVars) : answer.title
  const body = [
    answer.bodyKey ? t(answer.bodyKey, answer.bodyVars) : answer.body,
    answer.hospital ? t('food.forHospital', { hospital: answer.hospital }) : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Card className="p-3.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[16px] font-semibold text-ink">{title}</p>
        <VerdictPill verdict={answer.verdict} />
      </div>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{body}</p>
      {answer.split && (
        <div className="mt-3 grid gap-2">
          {answer.split.map((part) => (
            <div key={part.titleKey} className="flex items-start justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <div>
                <p className="text-[13px] font-semibold text-ink">{t(part.titleKey)}</p>
                <p className="text-[12px] text-muted">{t(part.bodyKey)}</p>
              </div>
              <VerdictPill verdict={part.verdict} compact />
            </div>
          ))}
        </div>
      )}
      <SourceLine text={answer.source} rules={answer.rules} />
    </Card>
  )
}
