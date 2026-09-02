import type { ReactNode } from 'react'
import { format, formatDistanceStrict, isAfter, isBefore } from 'date-fns'
import { ArrowRight, Droplets, Sparkles, Utensils } from 'lucide-react'
import { HOSPITALS } from '../data/hospitals'
import { Card, PrimaryButton, SectionLabel } from '../components/ui'
import { cn } from '../lib/cn'
import { useLang } from '../i18n/LanguageContext'
import type { PrepSession, Screen } from '../lib/session'
import { buildTimeline, resolveEventText } from '../lib/timeline'

export function Home({
  session,
  onOpen,
}: {
  session: PrepSession
  onOpen: (s: Screen) => void
}) {
  const { t } = useLang()
  const hospital = HOSPITALS[session.hospitalId]
  const events = buildTimeline(session)
  const now = new Date()
  const next = events.find((e) => isAfter(e.at, now)) ?? events[events.length - 1]
  const report = events.find((e) => e.id === 'arrive')?.at
  const remaining = report ? formatDistanceStrict(report, now, { addSuffix: true }) : ''
  const started = events[0] ? isBefore(events[0].at, now) : false
  const juice =
    hospital.fruitJuice === 'yes'
      ? t('home.juiceYes')
      : hospital.fruitJuice === 'no'
        ? t('home.juiceNo')
        : t('home.juiceAsk')

  return (
    <div className="px-5 pb-8 pt-6">
      <SectionLabel>{t('home.session', { id: session.id })}</SectionLabel>
      {session.firstName ? (
        <>
          <h1 className="font-display mt-1 text-[32px] leading-[1.1] tracking-tight text-ink">
            {t('home.hi', { name: session.firstName })}
          </h1>
          <p className="mt-1 text-[17px] font-semibold text-ink">
            {t(session.slot === 'am' ? 'home.morningScope' : 'home.afternoonScope', {
              hospital: hospital.short,
            })}
          </p>
        </>
      ) : (
        <h1 className="font-display mt-1 text-[32px] leading-[1.1] tracking-tight text-ink">
          {t(session.slot === 'am' ? 'home.morningScope' : 'home.afternoonScope', {
            hospital: hospital.short,
          })}
        </h1>
      )}
      <p className="mt-1 text-[15px] text-ink-soft">
        {format(new Date(session.date + 'T12:00:00'), 'EEE d MMM yyyy')} · {t('home.report', { time: session.reportingTime })}
        {report ? ` · ${isAfter(report, now) ? remaining : ''}` : ''}
      </p>

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
                <p className="mt-1 text-[13px] text-muted">{format(next.at, 'EEE d MMM, h:mm a')}</p>
                <p className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-teal-deep">
                  {t('home.openTimeline')} <ArrowRight size={16} />
                </p>
              </div>
            </div>
          </Card>
        </button>
      )}

      <button type="button" onClick={() => onOpen('reminders')} className="mt-4 w-full text-left">
        <Card className="overflow-hidden">
          <div className="flex items-start gap-3 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-whatsapp text-white">
              <WhatsAppMark />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[20px] leading-tight tracking-tight text-ink">
                {t(session.waOptIn ? 'home.waOn' : 'home.waTitle')}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {['T−72', 'T−24', 'T−6'].map((label) => (
                  <span
                    key={label}
                    className="rounded-full bg-[#e8f8ee] px-2 py-0.5 text-[11px] font-semibold text-[#128c47]"
                  >
                    {label}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">{t('home.waBody')}</p>
              <p className="mt-3 inline-flex min-h-[40px] items-center rounded-full bg-whatsapp px-4 text-[15px] font-semibold text-white">
                {t(session.waOptIn ? 'home.waOnCta' : 'home.waCta')}
              </p>
            </div>
          </div>
        </Card>
      </button>

      <Card className="mt-4 overflow-hidden">
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
      </Card>

      <Card className="mt-4 p-4">
        <div className="flex items-start gap-2">
          <Sparkles size={16} className="mt-0.5 text-teal-deep" />
          <div>
            <p className="text-[13px] font-semibold text-navy">{t('home.faithful')}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
              {t('home.faithfulBody', {
                hospital: hospital.short,
                lastMeal: hospital.lastMeal,
                milk: hospital.milkInCoffee === 'yes' ? t('home.milkYes') : t('home.milkNo'),
                juice,
              })}
            </p>
          </div>
        </div>
      </Card>

      <PrimaryButton className="mt-5" onClick={() => onOpen('timeline')}>
        {t('home.review')}
      </PrimaryButton>
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

function WhatsAppMark() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
      <path d="M12.04 2c-5.46 0-9.91 4.44-9.91 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.72 14.24c-.24.68-1.4 1.3-1.94 1.35-.49.04-1.1.06-1.77-.11-.41-.1-.93-.3-1.6-.59-2.82-1.22-4.65-4.07-4.79-4.26-.14-.19-1.15-1.53-1.15-2.92 0-1.39.73-2.07.98-2.35.25-.28.55-.35.73-.35h.53c.17 0 .4-.06.63.48.24.56.8 1.96.87 2.1.07.14.12.31.02.5-.1.19-.15.31-.3.48-.14.17-.3.37-.43.5-.14.14-.29.29-.12.56.16.28.73 1.2 1.57 1.95 1.08.96 1.99 1.26 2.27 1.4.28.14.44.12.6-.07.16-.19.7-.82.89-1.1.19-.28.37-.23.63-.14.25.1 1.6.75 1.87.89.28.14.46.21.53.32.07.12.07.68-.17 1.36z" />
    </svg>
  )
}
