import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Expand, X } from 'lucide-react'
import { StoolCartoon } from '../components/stool/StoolCartoon'
import { SegmentedControl } from '../components/SegmentedControl'
import { Card } from '../components/ui'
import { useLang } from '../i18n/LanguageContext'
import { useSessionHospital } from '../hooks/useSessionHospital'
import type { ApiStoolReady, ApiStoolScale, ApiStoolScaleStage } from '../lib/api'
import type { PrepSession } from '../lib/session'
import { extraStageSlots, isCupScale, stageLook, stagePhotoSrc } from '../lib/stoolVisuals'
import { cn } from '../lib/cn'
import { easeOut } from '../lib/motion'
import type { StringKey } from '../i18n/strings'

type ViewMode = 'cartoon' | 'photos'

export function StoolGuide({
  session,
}: {
  session: PrepSession
}) {
  const { t, tx } = useLang()
  const { hospital, loading, error } = useSessionHospital(session)
  const scale = hospital?.stool_scale
  const showBadges = scale?.show_ready_badges === true
  const notReadyAction = scale?.not_ready_action?.trim() || null
  const cupScale = scale ? isCupScale(scale.key) : false
  const [view, setView] = useState<ViewMode>('cartoon')
  const [open, setOpen] = useState<{ stage: ApiStoolScaleStage; src: string } | null>(null)

  const lastN = scale?.stages.at(-1)?.n ?? 0

  return (
    <div className="px-5 pb-10 pt-4">
      {!loading && !scale ? (
        <p className="text-[14px] text-no">{tx(error ?? t('err.hospitals'))}</p>
      ) : null}

      {!loading && scale ? (
        <Card className="mb-3 border-ask/30 bg-ask-bg/40 p-4">
          <p className="text-[14px] font-semibold text-ask">
            {t(notReadyAction ? 'stool.ifNotReady' : 'stool.ifUnsure')}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
            {notReadyAction ? tx(notReadyAction) : t('stool.ifUnsureBody')}
          </p>
        </Card>
      ) : null}

      {cupScale ? (
        <SegmentedControl
          value={view}
          onChange={setView}
          className="mb-3 h-11 rounded-xl"
          buttonClassName="px-3 text-[15px]"
          options={[
            { id: 'cartoon', label: t('stool.viewCartoon') },
            { id: 'photos', label: t('stool.viewPhotos') },
          ]}
        />
      ) : null}

      <div className="grid gap-2">
        {scale?.stages.map((stage) => (
          <StageCard
            key={stage.n}
            stage={stage}
            scale={scale}
            lastN={lastN}
            view={cupScale ? view : 'cartoon'}
            showBadge={showBadges}
            t={t}
            tx={tx}
            onOpenPhoto={(src) => setOpen({ stage, src })}
          />
        ))}
      </div>

      <AnimatePresence>
        {open && scale ? (
          <PhotoSheet
            stage={open.stage}
            scaleKey={scale.key}
            lastN={lastN}
            onClose={() => setOpen(null)}
            t={t}
            tx={tx}
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function StageCard({
  stage,
  scale,
  lastN,
  view,
  showBadge,
  t,
  tx,
  onOpenPhoto,
}: {
  stage: ApiStoolScaleStage
  scale: ApiStoolScale
  lastN: number
  view: ViewMode
  showBadge: boolean
  t: (key: StringKey) => string
  tx: (text: string) => string
  onOpenPhoto: (src: string) => void
}) {
  const ready = stage.ready
  const look = stageLook(scale.key, stage)
  const photo = stagePhotoSrc(stage)
  const extras = extraStageSlots(scale.key, stage, lastN)
  const photoMode = view === 'photos' && Boolean(photo)
  const lastStages = stage.n >= lastN - 1

  return (
    <Card className="flex items-center gap-3 p-3">
      {photoMode && photo ? (
        <button
          type="button"
          onClick={() => onOpenPhoto(photo)}
          className="relative shrink-0 overflow-hidden rounded-2xl bg-white"
        >
          <img
            src={photo}
            alt={`${stage.n}. ${tx(stage.name)}`}
            className="h-[108px] w-[92px] object-contain"
          />
          <span className="absolute right-1 bottom-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white">
            <Expand size={14} />
            <span className="sr-only">{t('stool.tapToEnlarge')}</span>
          </span>
        </button>
      ) : (
        <span className="flex h-[108px] w-[92px] shrink-0 items-center justify-center rounded-2xl bg-white">
          <StageVisual stage={stage} scaleKey={scale.key} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-ink">
          {stage.n}. {tx(stage.name)}
        </p>
        {look ? <p className="mt-0.5 text-[12px] leading-snug text-muted">{tx(look)}</p> : null}
        {photoMode && lastStages && extras > 0 ? (
          <button
            type="button"
            onClick={() => onOpenPhoto(photo!)}
            className="mt-1.5 text-[12px] font-semibold text-teal-deep"
          >
            {t('stool.moreExamples')}
          </button>
        ) : null}
      </div>
      {showBadge && ready ? <ReadyBadge ready={ready}>{readyLabel(t, ready)}</ReadyBadge> : null}
    </Card>
  )
}

function StageVisual({
  stage,
  scaleKey,
}: {
  stage: ApiStoolScaleStage
  scaleKey: string
}) {
  if (isCupScale(scaleKey) && stage.color) {
    return <StoolCartoon scaleKey={scaleKey} n={stage.n} color={stage.color} className="h-[100px] w-[84px]" />
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

function PhotoSheet({
  stage,
  scaleKey,
  lastN,
  onClose,
  t,
  tx,
}: {
  stage: ApiStoolScaleStage
  scaleKey: string
  lastN: number
  onClose: () => void
  t: (key: StringKey) => string
  tx: (text: string) => string
}) {
  const main = stagePhotoSrc(stage)
  const extraCount = extraStageSlots(scaleKey, stage, lastN)
  const [current, setCurrent] = useState<'main' | number>('main')
  const lastStages = stage.n >= lastN - 1
  const host = typeof document !== 'undefined' ? document.querySelector('[data-app-column]') : null
  const look = stageLook(scaleKey, stage)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!host) return null

  return createPortal(
    <motion.div
      className="absolute inset-0 z-50 flex items-end justify-center sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: easeOut }}
    >
      <button type="button" aria-label={t('tour.done')} className="absolute inset-0 bg-navy/55" onClick={onClose} />
      <motion.div
        className="relative mx-3 mb-4 flex max-h-[min(92dvh,720px)] w-full flex-col overflow-hidden rounded-3xl bg-paper-2 shadow-xl sm:mb-0"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2, ease: easeOut }}
      >
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[16px] font-semibold text-ink">
                {stage.n}. {tx(stage.name)}
              </p>
              {look ? <p className="mt-0.5 text-[13px] leading-snug text-muted">{tx(look)}</p> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper text-ink"
              aria-label={t('tour.done')}
            >
              <X size={18} />
            </button>
          </div>

          {main && current === 'main' ? (
            <img
              src={main}
              alt={`${stage.n}. ${tx(stage.name)}`}
              className="mt-3 max-h-[52dvh] w-full rounded-[18px] bg-paper object-contain"
            />
          ) : (
            <div className="mt-3 flex min-h-[220px] items-center justify-center rounded-[18px] bg-paper px-4 text-center">
              <p className="text-[14px] leading-relaxed text-muted">{t('stool.photoSoon')}</p>
            </div>
          )}

          {lastStages ? (
            <p className="mt-3 pb-2 text-[13px] leading-relaxed text-ink-soft">{t('stool.lastStagesHint')}</p>
          ) : null}
        </div>

        {main && extraCount > 0 ? (
          <div className="shrink-0 px-4 pb-5 pt-2">
            <p className="text-[12px] font-semibold text-muted">{t('stool.moreExamples')}</p>
            <div className="mt-2 flex gap-3">
              <ThumbButton selected={current === 'main'} onClick={() => setCurrent('main')}>
                <img src={main} alt="" className="h-14 w-12 object-contain" />
              </ThumbButton>
              {Array.from({ length: extraCount }, (_, i) => (
                <ThumbButton key={i} selected={current === i} onClick={() => setCurrent(i)}>
                  <span className="px-1 text-center text-[10px] font-semibold leading-tight text-muted">
                    {t('stool.photoSoon')}
                  </span>
                </ThumbButton>
              ))}
            </div>
          </div>
        ) : null}
      </motion.div>
    </motion.div>,
    host,
  )
}

function ThumbButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-2xl bg-transparent p-1.5 outline-none focus:outline-none focus-visible:outline-none"
    >
      <span
        className={cn(
          'flex h-16 w-14 items-center justify-center overflow-hidden rounded-xl bg-white',
          selected ? 'ring-2 ring-teal' : 'ring-1 ring-black/10',
        )}
      >
        {children}
      </span>
    </button>
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
  t: (key: StringKey) => string,
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
