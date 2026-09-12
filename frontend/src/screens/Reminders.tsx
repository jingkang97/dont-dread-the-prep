import { format, isAfter, parseISO } from 'date-fns'
import { Bell, Check, Info } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect } from 'react'
import { ScreenHeader } from '../components/ScreenHeader'
import { Card, GhostButton, PrimaryButton } from '../components/ui'
import { useLang } from '../i18n/LanguageContext'
import { cn } from '../lib/cn'
import { DATE_LOCALES } from '../lib/dateLocale'
import type { StringKey } from '../i18n/strings'
import type { PrepSession } from '../lib/session'
import { fromApiSession, saveSession, TELEGRAM_BOT, telegramStartHref } from '../lib/session'
import { getApiSession } from '../lib/api'
import { sessionReportAt } from '../lib/dates'
import { remindersFor } from '../lib/timeline'
import { easeOut } from '../lib/motion'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard'
import { usePushReminders } from '../hooks/usePushReminders'
import { useTelegramLink } from '../hooks/useTelegramLink'

const WA_COPY: Record<string, { label: StringKey; blurb: StringKey }> = {
  t72: { label: 'wa.t72', blurb: 'wa.t72b' },
  t24: { label: 'wa.t24', blurb: 'wa.t24b' },
  t6: { label: 'wa.t6', blurb: 'wa.t6b' },
}

export function Reminders({
  session,
  onSession,
  onShortcut,
}: {
  session: PrepSession
  onSession: (s: PrepSession) => void
  onShortcut: (os: 'ios' | 'android') => void
}) {
  const { t, lang } = useLang()
  const { copied, copy } = useCopyToClipboard()
  const report = sessionReportAt(session)
  const demo = session.reminderMode === 'demo'
  const plan = session.reminderPlan
  const items = plan?.length
    ? plan.map((item) => ({
        key: item.key,
        copy: item.copyKey,
        title: item.title,
        at: item.at ? parseISO(item.at) : null,
        delayLabel: item.delayLabel,
        sent: item.sent,
      }))
    : remindersFor(report).map((item) => ({
        key: item.key,
        copy: item.key,
        title: t(WA_COPY[item.key].label),
        at: item.at,
        delayLabel: '',
        sent: false,
      }))
  const href = telegramStartHref(session.id)
  const push = usePushReminders(session, onSession)
  const telegram = useTelegramLink(session, onSession)

  useEffect(() => {
    if (!demo || (!session.telegramLinked && !session.pushOptIn)) return
    const timer = window.setInterval(() => {
      void getApiSession(session.id)
        .then((row) => {
          const next = fromApiSession(row)
          saveSession(next)
          onSession(next)
        })
        .catch(() => undefined)
    }, 10_000)
    return () => window.clearInterval(timer)
  }, [demo, session.id, session.telegramLinked, session.pushOptIn, onSession])

  return (
    <div className="px-5 pb-10 pt-6">
      <ScreenHeader kicker={t('wa.kicker')} title={t('wa.title')} lead={t('wa.lead', { id: session.id })} />

      <Card className="mt-5 p-4">
        <p className="text-[13px] font-semibold text-navy">{t('wa.welcome')}</p>
        <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">
          {t(demo ? 'wa.welcomeBodyDemo' : 'wa.welcomeBody')}
        </p>
      </Card>

      <Card className="mt-4 p-4">
        <p className="text-[13px] font-semibold text-navy">{t('wa.times')}</p>
        <ul className="mt-2 divide-y divide-line">
          {items.map((item) => (
            <li key={item.key} className="py-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[14px] font-semibold text-ink">
                  {item.title}
                </span>
                <span className="text-[12px] text-muted">
                  {item.at && !isAfter(item.at, new Date())
                    ? t('wa.passed')
                    : item.sent
                      ? t('wa.sent')
                      : item.at
                        ? format(item.at, 'd MMM, h:mm a', { locale: DATE_LOCALES[lang] })
                        : item.delayLabel}
                </span>
              </div>
              <p className="text-[12px] text-ink-soft">{t(WA_COPY[item.copy].blurb)}</p>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[12px] text-muted">
          {demo
            ? t('wa.computedDemo')
            : t('wa.computed', { hospital: session.hospitalShort, time: session.reportingTime })}
        </p>
      </Card>

      <p className="mt-5 text-[13px] font-semibold text-muted">{t('wa.channels')}</p>
      <div className="mt-2 grid grid-cols-2 gap-3">
        <Card className="flex flex-col p-3.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-teal/15 text-teal-deep">
            <Bell size={18} />
          </span>
          <p className="mt-2.5 text-[15px] font-semibold leading-tight text-ink">{t('wa.pushTitle')}</p>
          <p className="mt-1 flex-1 text-[12px] leading-relaxed text-ink-soft">{t('wa.pushBody')}</p>
          {session.pushOptIn ? (
            <GhostButton className="mt-3 py-2.5 text-[14px]" onClick={() => void push.disable()}>
              {t('wa.pushOff')}
            </GhostButton>
          ) : (
            <PrimaryButton
              className="mt-3 py-2.5 text-[14px]"
              disabled={push.busy}
              onClick={() => {
                if (push.needsInstall) onShortcut(push.shortcutOs)
                else void push.enable()
              }}
            >
              {push.busy ? t('wa.pushBusy') : t('wa.pushAllow')}
            </PrimaryButton>
          )}
        </Card>

        <Card className="flex flex-col p-3.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-telegram text-white">
            <TelegramMark />
          </span>
          <p className="mt-2.5 text-[15px] font-semibold leading-tight text-ink">{t('wa.sandbox')}</p>
          <p className="mt-1 flex-1 text-[12px] leading-relaxed text-ink-soft">{t('wa.sandboxBody')}</p>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="mt-3"
            onClick={() => {
              void telegram.startLink()
            }}
          >
            <PrimaryButton className="bg-telegram py-2.5 text-[14px]">
              {telegram.waiting ? t('wa.waiting') : t('wa.open')}
            </PrimaryButton>
          </a>
        </Card>
      </div>

      {push.needsInstall && !session.pushOptIn && (
        <p
          role="note"
          className="mt-3 flex items-start gap-2 rounded-xl bg-cream px-3 py-2.5 text-[13px] leading-snug text-teal-deep"
        >
          <Info size={16} className="mt-0.5 shrink-0" aria-hidden />
          <span>{t('wa.pushNeedInstall')}</span>
        </p>
      )}
      {!push.supported && (
        <p className="mt-3 text-[13px] leading-relaxed text-muted">{t('wa.pushUnsupported')}</p>
      )}
      {push.error && (
        <p className="mt-3 text-[13px] font-semibold text-no">
          {t(push.error === 'denied' ? 'wa.pushDenied' : 'wa.pushError')}
        </p>
      )}
      {session.pushOptIn && <p className="mt-3 text-[13px] font-semibold text-yes">{t('wa.pushOn')}</p>}

      <Card className="mt-4 p-4">
        <p className="text-[13px] font-semibold text-navy">{t('wa.startHint')}</p>
        <p className="mt-3 rounded-xl bg-paper px-3 py-2 font-mono text-[12px] leading-relaxed text-ink">
          t.me/{TELEGRAM_BOT}?start={session.id}
        </p>
        <p className="mt-2 text-[11px] leading-relaxed text-muted">
          {t('wa.sandboxNote', { bot: TELEGRAM_BOT, id: session.id })}
        </p>
      </Card>

      {session.telegramLinked && (
        <p className="mt-3 text-center text-[13px] font-semibold text-yes">{t('wa.optin', { id: session.id })}</p>
      )}
      {telegram.timedOut && !session.telegramLinked && (
        <p className="mt-3 text-center text-[13px] font-semibold text-no">{t('wa.waitingTimeout')}</p>
      )}

      <GhostButton className={cn('mt-4', copied && 'bg-yes-bg text-yes')} onClick={() => copy(session.id)}>
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

function TelegramMark() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
    </svg>
  )
}
