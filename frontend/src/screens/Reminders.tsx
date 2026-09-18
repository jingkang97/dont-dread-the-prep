import { format, isAfter, parseISO } from 'date-fns'
import { Bell, ChevronLeft, Info } from 'lucide-react'
import { useEffect } from 'react'
import { ScreenHeader } from '../components/ScreenHeader'
import { Card, GhostButton, PrimaryButton } from '../components/ui'
import { useLang } from '../i18n/LanguageContext'
import { usePrimeLiveCopy } from '../i18n/liveCopy'
import { DATE_LOCALES } from '../lib/dateLocale'
import type { PrepSession } from '../lib/session'
import { fromApiSession, saveSession, telegramStartHref } from '../lib/session'
import { getApiSession } from '../lib/api'
import { usePushReminders } from '../hooks/usePushReminders'
import { useTelegramLink } from '../hooks/useTelegramLink'

export function Reminders({
  session,
  onSession,
  onShortcut,
  onBack,
}: {
  session: PrepSession
  onSession: (s: PrepSession) => void
  onShortcut: (os: 'ios' | 'android') => void
  onBack: () => void
}) {
  const { t, lang, tx } = useLang()
  const plan = session.reminderPlan
  const items = plan?.length
    ? plan.map((item) => ({
        key: item.key,
        title: item.title,
        body: item.body,
        at: item.at ? parseISO(item.at) : null,
        delayLabel: item.delayLabel,
        sent: item.sent,
      }))
    : []
  usePrimeLiveCopy(
    items.flatMap((item) => [item.title, item.body, item.delayLabel].filter((text): text is string => Boolean(text))),
  )
  const href = telegramStartHref(session.id)
  const push = usePushReminders(session, onSession)
  const telegram = useTelegramLink(session, onSession)

  useEffect(() => {
    const pull = () => {
      void getApiSession(session.id)
        .then((row) => {
          const next = fromApiSession(row)
          saveSession(next)
          onSession(next)
        })
        .catch(() => undefined)
    }
    pull()
  }, [session.id, onSession])

  return (
    <div className="px-5 pb-10 pt-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-3 inline-flex items-center gap-0.5 text-[13px] font-semibold text-teal-deep"
      >
        <ChevronLeft size={16} strokeWidth={2.4} />
        {t('nav.home')}
      </button>
      <ScreenHeader title={t('wa.title')} />

      <Card className="mt-5 p-4">
        <p className="text-[13px] font-semibold text-navy">{t('wa.welcome')}</p>
        <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">
          {t('wa.welcomeBody')}
        </p>
        {push.needsInstall && !session.pushOptIn && (
          <p
            role="note"
            className="mt-3 flex items-start gap-2 rounded-xl bg-cream px-3 py-2.5 text-[13px] leading-snug text-teal-deep"
          >
            <Info size={16} className="mt-0.5 shrink-0" aria-hidden />
            <span>{t('wa.pushNeedInstall')}</span>
          </p>
        )}
      </Card>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Card className="flex flex-col p-3.5">
          <div className="flex items-start justify-between gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-teal/15 text-teal-deep">
              <Bell size={18} />
            </span>
            {session.pushOptIn && <OnBadge>{t('wa.on')}</OnBadge>}
          </div>
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
          <div className="flex items-start justify-between gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-telegram text-white">
              <TelegramMark />
            </span>
            {session.telegramLinked && <OnBadge>{t('wa.on')}</OnBadge>}
          </div>
          <p className="mt-2.5 text-[15px] font-semibold leading-tight text-ink">{t('wa.sandbox')}</p>
          <p className="mt-1 flex-1 text-[12px] leading-relaxed text-ink-soft">
            {t(session.telegramLinked ? 'wa.sandboxBodyOn' : 'wa.sandboxBody')}
          </p>
          {session.telegramLinked ? (
            <GhostButton
              className="mt-3 py-2.5 text-[14px]"
              onClick={() => {
                if (!telegram.busy) void telegram.disable()
              }}
            >
              {t('wa.telegramOff')}
            </GhostButton>
          ) : (
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
          )}
        </Card>
      </div>

      {!push.supported && (
        <p className="mt-3 text-[13px] leading-relaxed text-muted">{t('wa.pushUnsupported')}</p>
      )}
      {push.error && (
        <p className="mt-3 text-[13px] font-semibold text-no">
          {t(push.error === 'denied' ? 'wa.pushDenied' : 'wa.pushError')}
        </p>
      )}
      {telegram.timedOut && !session.telegramLinked && (
        <p className="mt-3 text-[13px] font-semibold text-no">{t('wa.waitingTimeout')}</p>
      )}

      <Card className="mt-5 p-4">
        <p className="text-[13px] font-semibold text-navy">{t('wa.times')}</p>
        <ul className="mt-2 divide-y divide-line">
          {items.map((item) => (
            <li key={item.key} className="py-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[14px] font-semibold text-ink">
                  {tx(item.title)}
                </span>
                <span className="text-[12px] text-muted">
                  {item.sent
                    ? t('wa.sent')
                    : item.at && !isAfter(item.at, new Date())
                      ? t('wa.passed')
                      : item.at
                        ? format(item.at, 'd MMM, h:mm a', { locale: DATE_LOCALES[lang] })
                        : item.delayLabel
                          ? tx(item.delayLabel)
                          : ''}
                </span>
              </div>
              <p className="text-[12px] text-ink-soft">{item.body ? tx(item.body) : ''}</p>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[12px] text-muted">
          {t('wa.computed', { hospital: tx(session.hospitalShort), time: session.reportingTime })}
        </p>
      </Card>
    </div>
  )
}

function OnBadge({ children }: { children: string }) {
  return (
    <span className="rounded-full bg-yes-bg px-2 py-0.5 text-[10px] font-bold tracking-wide text-yes">
      {children}
    </span>
  )
}

function TelegramMark() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
    </svg>
  )
}
