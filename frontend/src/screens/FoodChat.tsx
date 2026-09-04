import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Send } from 'lucide-react'
import { classify, SUGGESTIONS, type ChatAnswer } from '../data/foods'
import { HOSPITALS } from '../data/hospitals'
import { Card, SectionLabel, SourceLine, VerdictPill } from '../components/ui'
import { useLang } from '../i18n/LanguageContext'
import type { StringKey } from '../i18n/strings'
import { loadFoodChat, saveFoodChat, type FoodChatMsg } from '../lib/foodChat'
import type { PrepSession } from '../lib/session'
import { fadeY } from '../lib/motion'

export function FoodChat({ session }: { session: PrepSession }) {
  const { t } = useLang()
  const hospital = HOSPITALS[session.hospitalId]
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<FoodChatMsg[]>(() => loadFoodChat(session.id))
  const listRef = useRef<HTMLDivElement>(null)
  const skipEnter = useRef(messages.length > 0)

  const intro: ChatAnswer = {
    verdict: 'ask',
    title: t('food.introTitle', { hospital: hospital.short }),
    body: t('food.introBody'),
    source: 'Doc 03 Low-residue ruleset — DRAFT, not dietitian-approved',
    rules: ['HOSP'],
    matched: 'intro',
  }

  useEffect(() => {
    saveFoodChat(session.id, messages)
  }, [session.id, messages])

  useEffect(() => {
    if (messages.length === 0) return
    const el = listRef.current
    if (!el) return
    const instant = skipEnter.current
    skipEnter.current = false
    el.scrollTo({ top: el.scrollHeight, behavior: instant ? 'auto' : 'smooth' })
  }, [messages])

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

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="px-5 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <SectionLabel>{t('food.kicker')}</SectionLabel>
            <h1 className="font-display mt-1 text-[28px] leading-tight text-navy">{t('food.title')}</h1>
          </div>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => setMessages([])}
              className="mt-7 shrink-0 text-[13px] font-semibold text-teal-deep"
            >
              {t('food.clear')}
            </button>
          )}
        </div>
        <p className="mt-1 text-[13px] text-ink-soft">{t('food.lead', { hospital: hospital.short })}</p>
      </div>

      <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
        <BotCard answer={intro} />
        {messages.map((msg) =>
          msg.role === 'user' ? (
            <motion.div key={msg.id} className="flex justify-end" {...(skipEnter.current ? {} : fadeY)}>
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
