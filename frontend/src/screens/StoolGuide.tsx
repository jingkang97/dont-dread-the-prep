import { ArrowRight, Bell } from 'lucide-react'
import { ScreenHeader } from '../components/ScreenHeader'
import { Card } from '../components/ui'
import { hospCopyOr } from '../i18n/keys'
import { useLang } from '../i18n/LanguageContext'
import { useSessionHospital } from '../hooks/useSessionHospital'
import type { ApiStoolReady, ApiStoolScaleStage } from '../lib/api'
import type { PrepSession } from '../lib/session'
import { cn } from '../lib/cn'

export function StoolGuide({
  session,
  onReminders,
}: {
  session: PrepSession
  onReminders: () => void
}) {
  const { t } = useLang()
  const { hospital, loading } = useSessionHospital(session)
  const scale = hospital?.stool_scale
  const showBadges = scale?.show_ready_badges === true
  const notReadyAction = scale?.not_ready_action?.trim() || null

  const hospitalNote = hospCopyOr(t, session.hospitalId, 'stoolAction', '')

  return (
    <div className="px-5 pb-10 pt-6">
      <ScreenHeader
        kicker={t('stool.kicker')}
        title={t('stool.title')}
        lead={hospitalNote ? `${t('stool.lead')} ${hospitalNote}` : t('stool.lead')}
      />

      <div className="mt-5 grid gap-2">
        {scale?.stages.map((stage) => (
          <StageCard key={stage.n} stage={stage} showBadge={showBadges} t={t} />
        ))}
      </div>

      {!loading && scale ? (
        <Card className="mt-4 border-ask/30 bg-ask-bg/40 p-4">
          <p className="text-[14px] font-semibold text-ask">
            {t(notReadyAction ? 'stool.ifNotReady' : 'stool.ifUnsure')}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
            {notReadyAction ?? t('stool.ifUnsureBody')}
          </p>
        </Card>
      ) : null}

      <button type="button" onClick={onReminders} className="mt-5 w-full text-left">
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-teal/15 text-teal-deep">
            <Bell size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold text-ink">{t('stool.reminders')}</span>
            <span className="mt-0.5 block text-[13px] leading-relaxed text-muted">{t('stool.remindersBody')}</span>
          </span>
          <ArrowRight size={16} className="shrink-0 text-muted" />
        </Card>
      </button>
    </div>
  )
}

function StageCard({
  stage,
  showBadge,
  t,
}: {
  stage: ApiStoolScaleStage
  showBadge: boolean
  t: (key: 'stool.ready' | 'stool.almost' | 'stool.notReady') => string
}) {
  const ready = stage.ready

  return (
    <Card className="flex items-center gap-3 p-3">
      <StageVisual stage={stage} />
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-ink">
          {stage.n}. {stage.name}
        </p>
        <p className="text-[12px] text-muted">{stage.look}</p>
      </div>
      {showBadge && ready ? <ReadyBadge ready={ready}>{readyLabel(t, ready)}</ReadyBadge> : null}
    </Card>
  )
}

function StageVisual({
  stage,
}: {
  stage: ApiStoolScaleStage
}) {
  if (stage.photo) {
    return (
      <img
        src={`/stool/${stage.photo}`}
        alt={`${stage.n}. ${stage.name}`}
        className="h-[72px] w-[72px] shrink-0 rounded-[14px] bg-white object-contain"
      />
    )
  }
  if (stage.color) {
    return <Cup color={stage.color} clear={stage.ready === 'ready' || stage.ready === 'almost'} />
  }
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream text-[15px] font-bold text-navy">
      {stage.n}
    </span>
  )
}

function ReadyBadge({
  ready,
  children,
}: {
  ready: ApiStoolReady
  children: string
}) {
  return (
    <span
      className={cn(
        'rounded-full px-2 py-1 text-[10px] font-bold tracking-wide',
        ready === 'ready' && 'bg-yes-bg text-yes',
        ready === 'almost' && 'bg-ask-bg text-ask',
        ready === 'not' && 'bg-no-bg text-no',
      )}
    >
      {children}
    </span>
  )
}

function readyLabel(
  t: (key: 'stool.ready' | 'stool.almost' | 'stool.notReady') => string,
  ready: ApiStoolReady,
) {
  if (ready === 'ready') return t('stool.ready')
  if (ready === 'almost') return t('stool.almost')
  return t('stool.notReady')
}

function Cup({ color, clear }: { color: string; clear: boolean }) {
  return (
    <svg width="36" height="44" viewBox="0 0 36 44" aria-hidden>
      <path
        d="M6 4h24l-2.2 34.5a4 4 0 0 1-4 3.7H12.2a4 4 0 0 1-4-3.7L6 4Z"
        fill="#f7f1e4"
        stroke="#c9bfa8"
        strokeWidth="1.4"
      />
      <path
        d={
          clear
            ? 'M9.2 14h17.6l-1.5 22.2a2.6 2.6 0 0 1-2.6 2.4H13.3a2.6 2.6 0 0 1-2.6-2.4L9.2 14Z'
            : 'M8.6 8h18.8l-1.8 28.6a3 3 0 0 1-3 2.7h-9.2a3 3 0 0 1-3-2.7L8.6 8Z'
        }
        fill={color}
        opacity={clear ? 0.75 : 0.95}
      />
    </svg>
  )
}
