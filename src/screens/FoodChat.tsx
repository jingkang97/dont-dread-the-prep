import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { classify, SUGGESTIONS, type ChatAnswer } from '../data/foods'
import { HOSPITALS } from '../data/hospitals'
import { Card, SectionLabel, SourceLine, VerdictPill } from '../components/ui'
import { useLang } from '../i18n/LanguageContext'
import type { PrepSession } from '../lib/session'

type Msg = { id: string; role: 'user' | 'bot'; text?: string; answer?: ChatAnswer }

export function FoodChat({ session }: { session: PrepSession }) {
  const { t, lang } = useLang()
  const hospital = HOSPITALS[session.hospitalId]
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Msg[]>([])
  const endRef = useRef<HTMLDivElement>(null)

  const intro: ChatAnswer = {
    verdict: 'ask',
    title: t('food.introTitle', { hospital: hospital.short }),
    body: t('food.introBody'),
    source: 'Doc 03 Low-residue ruleset — DRAFT, not dietitian-approved',
    rules: ['HOSP'],
    matched: 'intro',
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, lang])

  function ask(shown: string, query = shown) {
    const text = shown.trim()
    if (!text) return
    const answer = classify(query.trim(), session.hospitalId)
    setMessages((m) => [
      ...m,
      { id: crypto.randomUUID(), role: 'user', text },
      { id: crypto.randomUUID(), role: 'bot', answer },
    ])
    setInput('')
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="px-5 pt-6">
        <SectionLabel>{t('food.kicker')}</SectionLabel>
        <h1 className="font-display mt-1 text-[28px] leading-tight text-navy">{t('food.title')}</h1>
        <p className="mt-1 text-[13px] text-ink-soft">{t('food.lead', { hospital: hospital.short })}</p>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
        <BotCard answer={intro} />
        {messages.map((msg) =>
          msg.role === 'user' ? (
            <div key={msg.id} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-navy px-3.5 py-2.5 text-[14px] text-white">
                {msg.text}
              </div>
            </div>
          ) : (
            msg.answer && <BotCard key={msg.id} answer={msg.answer} />
          ),
        )}
        <div ref={endRef} />
      </div>

      <div className="shrink-0 border-t border-line bg-paper-2 px-4 pb-3 pt-3">
        <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => ask(t(s.label), s.query)}
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
  return (
    <Card className="p-3.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[16px] font-semibold text-ink">{answer.title}</p>
        <VerdictPill verdict={answer.verdict} />
      </div>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{answer.body}</p>
      {answer.split && (
        <div className="mt-3 grid gap-2">
          {answer.split.map((part) => (
            <div key={part.title} className="flex items-start justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <div>
                <p className="text-[13px] font-semibold text-ink">{part.title}</p>
                <p className="text-[12px] text-muted">{part.body}</p>
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
