import { ScreenHeader } from '../components/ScreenHeader'
import { Card } from '../components/ui'
import { useLang } from '../i18n/LanguageContext'
import { useSessionHospital } from '../hooks/useSessionHospital'
import type { ApiStoolReady, ApiStoolScaleStage } from '../lib/api'
import type { PrepSession } from '../lib/session'
import { cn } from '../lib/cn'

export function StoolGuide({
  session,
}: {
  session: PrepSession
}) {
  const { t, tx } = useLang()
  const { hospital, loading } = useSessionHospital(session)
  const scale = hospital?.stool_scale
  const showBadges = scale?.show_ready_badges === true
  const notReadyAction = scale?.not_ready_action?.trim() || null

  return (
    <div className="px-5 pb-10 pt-6">
      <ScreenHeader
        kicker={t('stool.kicker')}
        title={t('stool.title')}
        lead={t('stool.lead')}
      />

      <div className="mt-5 grid gap-2">
        {scale?.stages.map((stage) => (
          <StageCard key={stage.n} stage={stage} showBadge={showBadges} t={t} tx={tx} />
        ))}
      </div>

      {!loading && scale ? (
        <Card className="mt-4 border-ask/30 bg-ask-bg/40 p-4">
          <p className="text-[14px] font-semibold text-ask">
            {t(notReadyAction ? 'stool.ifNotReady' : 'stool.ifUnsure')}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
            {notReadyAction ? tx(notReadyAction) : t('stool.ifUnsureBody')}
          </p>
        </Card>
      ) : null}
    </div>
  )
}

function StageCard({
  stage,
  showBadge,
  t,
  tx,
}: {
  stage: ApiStoolScaleStage
  showBadge: boolean
  t: (key: 'stool.ready' | 'stool.almost' | 'stool.notReady') => string
  tx: (text: string) => string
}) {
  const ready = stage.ready

  return (
    <Card className="flex items-center gap-3 p-3">
      <StageVisual stage={stage} tx={tx} />
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-ink">
          {stage.n}. {tx(stage.name)}
        </p>
        {stage.look?.trim() ? <p className="text-[12px] text-muted">{tx(stage.look)}</p> : null}
      </div>
      {showBadge && ready ? <ReadyBadge ready={ready}>{readyLabel(t, ready)}</ReadyBadge> : null}
    </Card>
  )
}

function StageVisual({
  stage,
  tx,
}: {
  stage: ApiStoolScaleStage
  tx: (text: string) => string
}) {
  if (stage.photo) {
    return (
      <img
        src={`/stool/${stage.photo}`}
        alt={`${stage.n}. ${tx(stage.name)}`}
        className="h-[88px] w-[72px] shrink-0 rounded-[14px] bg-white object-contain"
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
