import { useEffect, useRef, useState } from 'react'
import { format, isAfter } from 'date-fns'
import { Check } from 'lucide-react'
import { motion } from 'motion/react'
import { HOSPITALS } from '../data/hospitals'
import { Card, GhostButton, PrimaryButton, SectionLabel } from '../components/ui'
import { useLang } from '../i18n/LanguageContext'
import { cn } from '../lib/cn'
import { DATE_LOCALES } from '../lib/dateLocale'
import type { StringKey } from '../i18n/strings'
import type { PrepSession } from '../lib/session'
import { markWaOptIn, TWILIO_JOIN_WORD, waJoinHref } from '../lib/session'
import { remindersFor } from '../lib/timeline'
import { easeOut } from '../lib/motion'

const WA_COPY: Record<string, { label: StringKey; blurb: StringKey }> = {
  t72: { label: 'wa.t72', blurb: 'wa.t72b' },
  t24: { label: 'wa.t24', blurb: 'wa.t24b' },
  t6: { label: 'wa.t6', blurb: 'wa.t6b' },
}

export function Reminders({
  session,
  onSession,
}: {
  session: PrepSession
  onSession: (s: PrepSession) => void
}) {
  const { t, lang } = useLang()
  const hospital = HOSPITALS[session.hospitalId]
  const [joinCode, setJoinCode] = useState(TWILIO_JOIN_WORD)
  const [copied, setCopied] = useState(false)
  const copyTimer = useRef<number | undefined>(undefined)
  const report = new Date(`${session.date}T${session.reportingTime}:00`)
  const items = remindersFor(report)
  const href = waJoinHref(joinCode)

  useEffect(() => () => window.clearTimeout(copyTimer.current), [])

  function legacyCopy(text: string) {
    const box = document.createElement('textarea')
    box.value = text
    box.setAttribute('readonly', '')
    box.style.position = 'fixed'
    box.style.opacity = '0'
    document.body.appendChild(box)
    box.select()
    document.execCommand('copy')
    document.body.removeChild(box)
  }

  function copyId() {
    try {
      const write = navigator.clipboard?.writeText(session.id)
      if (write) write.catch(() => legacyCopy(session.id))
      else legacyCopy(session.id)
    } catch {
      legacyCopy(session.id)
    }
    setCopied(true)
    window.clearTimeout(copyTimer.current)
    copyTimer.current = window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="px-5 pb-10 pt-6">
      <SectionLabel>{t('wa.kicker')}</SectionLabel>
      <h1 className="font-display mt-1 text-[28px] leading-tight text-navy">{t('wa.title')}</h1>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
        {t('wa.lead', { id: session.id })}
      </p>

      <Card className="mt-5 p-4">
        <p className="text-[13px] font-semibold text-navy">{t('wa.times')}</p>
        <ul className="mt-2 divide-y divide-line">
          {items.map((item) => (
            <li key={item.key} className="py-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[14px] font-semibold text-ink">{t(WA_COPY[item.key].label)}</span>
                <span className="text-[12px] text-muted">
                  {isAfter(item.at, new Date())
                    ? format(item.at, 'd MMM, h:mm a', { locale: DATE_LOCALES[lang] })
                    : t('wa.passed')}
                </span>
              </div>
              <p className="text-[12px] text-ink-soft">{t(WA_COPY[item.key].blurb)}</p>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[12px] text-muted">
          {t('wa.computed', { hospital: hospital.short, time: session.reportingTime })}
        </p>
      </Card>

      <Card className="mt-4 p-4">
        <p className="text-[13px] font-semibold text-navy">{t('wa.sandbox')}</p>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{t('wa.sandboxBody')}</p>
        <label className="mt-3 block text-[12px] font-semibold text-muted" htmlFor="join">
          {t('wa.joinWord')}
        </label>
        <input
          id="join"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-[15px]"
        />
        <p className="mt-3 rounded-xl bg-paper px-3 py-2 font-mono text-[12px] leading-relaxed text-ink">
          join {joinCode}
        </p>
        <a href={href} target="_blank" rel="noreferrer" onClick={() => onSession(markWaOptIn(session))}>
          <PrimaryButton className="mt-3 bg-whatsapp">{t('wa.open')}</PrimaryButton>
        </a>
        <p className="mt-2 text-[11px] leading-relaxed text-muted">{t('wa.sandboxNote')}</p>
      </Card>

      {session.waOptIn && (
        <p className="mt-3 text-center text-[13px] font-semibold text-yes">{t('wa.optin', { id: session.id })}</p>
      )}

      <GhostButton className={cn('mt-4', copied && 'bg-yes-bg text-yes')} onClick={copyId}>
        <span role="status" className="flex items-center justify-center gap-1.5">
          {copied && (
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.18, ease: easeOut }}
              className="flex"
            >
              <Check size={17} />
            </motion.span>
          )}
          {t(copied ? 'wa.copied' : 'wa.copy', { id: session.id })}
        </span>
      </GhostButton>
    </div>
  )
}
