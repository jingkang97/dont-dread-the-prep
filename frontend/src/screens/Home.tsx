import type { ReactNode } from 'react'
import { format, formatDistanceStrict, isAfter } from 'date-fns'
import { ArrowRight, Bell, Droplets, EllipsisVertical, Phone, Sparkles, Utensils } from 'lucide-react'
import { Card } from '../components/ui'
import { cn } from '../lib/cn'
import { useLang } from '../i18n/LanguageContext'
import type { PrepSession, Screen } from '../lib/session'
import { resolveEventText } from '../lib/timeline'
import { DATE_LOCALES } from '../lib/dateLocale'
import { formatYmd } from '../lib/dates'
import { usePrepSummary } from '../hooks/usePrepSummary'

export function Home({
  session,
  onOpen,
  onShortcut,
}: {
  session: PrepSession
  onOpen: (s: Screen) => void
  onShortcut: (os: 'ios' | 'android') => void
}) {
  const { t, lang } = useLang()
  const locale = DATE_LOCALES[lang]
  const { hospital, events, loading, error, now, next, nextWhen, report, started } = usePrepSummary(session)
  const remaining = report ? formatDistanceStrict(report, now, { addSuffix: true, locale }) : ''
  const remindersOn = session.telegramLinked || session.pushOptIn

  return (
    <div className="px-5 pb-8 pt-6">
      <div data-tour="home-hero">
        {session.firstName ? (
          <>
            <h1 className="font-display text-[32px] leading-[1.1] tracking-tight text-ink">
              {t('home.hi', { name: session.firstName })}
            </h1>
            <p className="mt-1 text-[17px] font-semibold text-ink">
              {t(session.slot === 'am' ? 'home.morningScope' : 'home.afternoonScope', {
                hospital: hospital.short,
              })}
            </p>
          </>
        ) : (
          <h1 className="font-display text-[32px] leading-[1.1] tracking-tight text-ink">
            {t(session.slot === 'am' ? 'home.morningScope' : 'home.afternoonScope', {
              hospital: hospital.short,
            })}
          </h1>
        )}
        <p className="mt-1 text-[15px] text-ink-soft">
          {formatYmd(session.date, lang)} · {t('home.report', { time: session.reportingTime })}
          {report ? ` · ${isAfter(report, now) ? remaining : ''}` : ''}
        </p>
      </div>

      {loading && events.length === 0 ? (
        <Card className="mt-5 p-4">
          <p className="text-[14px] text-muted">{t('app.regenerating')}</p>
        </Card>
      ) : null}

      {!loading && error ? (
        <Card className="mt-5 p-4">
          <p className="text-[14px] text-no">{error}</p>
        </Card>
      ) : null}

      {next && (
        <button type="button" onClick={() => onOpen('timeline')} className="mt-5 w-full text-left">
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-teal/15 text-teal-deep">
                <Sparkles size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-teal-deep">
                  {started ? t('home.upNext') : t('home.firstStep')}
                </p>
                <p className="font-display mt-0.5 text-[20px] leading-tight tracking-tight text-ink">
                  {resolveEventText(next, t).title}
                </p>
                <p className="mt-1 text-[13px] text-muted">
                  {format(next.at, 'EEE d MMM, h:mm a', { locale })}
                  {nextWhen ? ` · ${nextWhen}` : ''}
                </p>
                <p className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-teal-deep">
                  {t('home.openTimeline')} <ArrowRight size={16} />
                </p>
              </div>
            </div>
          </Card>
        </button>
      )}

      <Card data-tour="home-reminders" className="mt-4 overflow-hidden">
        <div className="flex items-start gap-3 p-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-teal/15 text-teal-deep">
            <Bell size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[20px] leading-tight tracking-tight text-ink">
              {t(remindersOn ? 'home.waOn' : 'home.waTitle')}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">{t('home.waBody')}</p>
            <button
              type="button"
              onClick={() => onOpen('reminders')}
              className="mt-3 inline-flex min-h-[40px] items-center rounded-full bg-navy px-4 text-[15px] font-semibold text-white"
            >
              {t(remindersOn ? 'home.waOnCta' : 'home.waCta')}
            </button>
          </div>
        </div>
      </Card>

      <Card data-tour="home-tools" className="mt-4 overflow-hidden">
        <Tile
          icon={<Utensils size={18} />}
          iconClass="bg-[#e8f8ff] text-[#007aff]"
          title={t('home.foodTitle')}
          body={t('home.foodBody')}
          onClick={() => onOpen('food')}
        />
        <div className="ml-[68px] h-px bg-line" />
        <Tile
          icon={<Droplets size={18} />}
          iconClass="bg-ask-bg text-ask"
          title={t('home.stoolTitle')}
          body={t('home.stoolBody')}
          onClick={() => onOpen('stool')}
        />
        <div className="ml-[68px] h-px bg-line" />
        <Tile
          icon={<Phone size={18} />}
          iconClass="bg-teal/15 text-teal-deep"
          title={t('home.contactsTitle')}
          body={t('home.contactsBody')}
          onClick={() => onOpen('contacts')}
        />
      </Card>

      <Card data-tour="home-shortcut" className="mt-4 p-4">
        <p className="text-[13px] font-semibold text-navy">{t('home.shortcut')}</p>
        <div className="mt-3 grid w-full grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onShortcut('ios')}
            className="flex w-full min-w-0 flex-col items-start gap-2 rounded-2xl bg-paper px-3 py-3 text-left"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-paper-2 text-ink">
              <IosShareIcon />
            </span>
            <span className="min-w-0">
              <span className="block text-[14px] font-semibold text-ink">{t('home.shortcutIosTab')}</span>
              <span className="mt-0.5 block text-[12px] leading-snug text-muted">{t('home.shortcutIos')}</span>
            </span>
            <span className="mt-auto inline-flex items-center gap-1 text-[12px] font-semibold text-teal-deep">
              {t('home.shortcutOpen')} <ArrowRight size={14} />
            </span>
          </button>
          <button
            type="button"
            onClick={() => onShortcut('android')}
            className="flex w-full min-w-0 flex-col items-start gap-2 rounded-2xl bg-paper px-3 py-3 text-left"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-paper-2 text-ink">
              <EllipsisVertical size={20} strokeWidth={2.4} />
            </span>
            <span className="min-w-0">
              <span className="block text-[14px] font-semibold text-ink">{t('home.shortcutAndroidTab')}</span>
              <span className="mt-0.5 block text-[12px] leading-snug text-muted">{t('home.shortcutAndroid')}</span>
            </span>
            <span className="mt-auto inline-flex items-center gap-1 text-[12px] font-semibold text-teal-deep">
              {t('home.shortcutOpen')} <ArrowRight size={14} />
            </span>
          </button>
        </div>
      </Card>
    </div>
  )
}

function Tile({
  icon,
  iconClass,
  title,
  body,
  onClick,
}: {
  icon: ReactNode
  iconClass: string
  title: string
  body: string
  onClick: () => void
}) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-start gap-3 p-4 text-left">
      <span className={cn('flex h-9 w-9 items-center justify-center rounded-[10px]', iconClass)}>{icon}</span>
      <span className="flex-1">
        <span className="block text-[15px] font-semibold text-ink">{title}</span>
        <span className="mt-0.5 block text-[13px] leading-relaxed text-muted">{body}</span>
      </span>
      <ArrowRight size={16} className="mt-1 text-muted" />
    </button>
  )
}

function IosShareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
      <path
        d="M12 4v11M8.5 7.5 12 4l3.5 3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 13v5.5A1.5 1.5 0 0 0 7.5 20h9a1.5 1.5 0 0 0 1.5-1.5V13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
