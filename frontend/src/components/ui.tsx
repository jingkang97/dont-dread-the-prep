import type { ReactNode } from 'react'
import { type RuleId, type Verdict } from '../data/foods'
import { useLang } from '../i18n/LanguageContext'
import type { StringKey } from '../i18n/strings'
import { cn } from '../lib/cn'

export function DraftBanner() {
  const { t } = useLang()
  return (
    <div className="flex h-11 shrink-0 items-center bg-ask-bg px-4 text-center text-[11px] leading-[1.35] text-ask">
      <p className="line-clamp-2 w-full">{t('draft.banner')}</p>
    </div>
  )
}

export function VerdictPill({ verdict, compact }: { verdict: Verdict; compact?: boolean }) {
  const { t } = useLang()
  const map = {
    yes: { label: t('verdict.yes'), className: 'bg-yes-bg text-yes' },
    no: { label: t('verdict.no'), className: 'bg-no-bg text-no' },
    ask: { label: t('verdict.ask'), className: 'bg-ask-bg text-ask' },
  }
  const v = map[verdict]
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full font-semibold',
        compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]',
        v.className,
      )}
    >
      {v.label}
    </span>
  )
}

export function SourceLine({ text, rules }: { text: string; rules?: RuleId[] }) {
  const { t } = useLang()
  return (
    <div className="mt-3 rounded-2xl bg-paper px-3 py-2.5 text-[12px] leading-relaxed text-ink-soft">
      <p className="font-semibold text-ink">{t('source.cited')}</p>
      <p className="mt-0.5">{text}</p>
      {rules && rules.length > 0 && (
        <p className="mt-1.5 text-[11px] text-muted">
          {rules.map((r) => `${r} · ${t(`rule.${r}` as StringKey)}`).join(' · ')}
        </p>
      )}
      <p className="mt-1.5 text-[11px] text-muted">{t('source.original')}</p>
    </div>
  )
}

export function Card({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('rounded-[20px] bg-paper-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)]', className)}>
      {children}
    </div>
  )
}

export function PrimaryButton({
  children,
  onClick,
  type = 'button',
  disabled,
  className,
}: {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'w-full rounded-full bg-navy px-4 py-3.5 text-[17px] font-semibold text-white transition active:scale-[0.98] disabled:opacity-40',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function GhostButton({
  children,
  onClick,
  className,
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full rounded-full bg-white px-4 py-3 text-[17px] font-semibold text-ink shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition active:scale-[0.98]',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-[13px] font-semibold text-muted">{children}</p>
}

export function GeneratingPane({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex flex-col items-center px-4 pt-16 text-center">
      <span
        className="h-9 w-9 animate-spin rounded-full border-[3px] border-teal/25 border-t-teal"
        aria-hidden
      />
      <p className="font-display mt-5 text-[22px] tracking-tight text-ink">{title}</p>
      <p className="mt-2 max-w-[16rem] text-[14px] leading-relaxed text-ink-soft">{hint}</p>
    </div>
  )
}
