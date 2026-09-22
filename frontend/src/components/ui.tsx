import type { HTMLAttributes, ReactNode } from 'react'
import { type Verdict } from '../data/foods'
import { useLang } from '../i18n/LanguageContext'
import { cn } from '../lib/cn'

export function VerdictPill({ verdict, compact }: { verdict: Verdict; compact?: boolean }) {
  const { t } = useLang()
  const map = {
    yes: { label: t('verdict.yes'), className: 'bg-yes-bg text-yes' },
    no: { label: t('verdict.no'), className: 'bg-no-bg text-no' },
    ask: { label: t('verdict.ask'), className: 'bg-ask-bg text-ask' },
    possible: { label: t('verdict.possible'), className: 'bg-possible-bg text-possible' },
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

// A tick or a cross rather than the worded pill: used where the row around it
// already says what is being judged, so the word would only repeat it. The
// label is still there for a screen reader.
export function VerdictMark({ verdict }: { verdict: Verdict }) {
  const { t } = useLang()
  const yes = verdict === 'yes'
  return (
    <span
      role="img"
      aria-label={t(yes ? 'verdict.yes' : 'verdict.no')}
      className={cn(
        'inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full',
        yes ? 'bg-yes-bg text-yes' : 'bg-no-bg text-no',
      )}
    >
      <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden>
        <path
          d={yes ? 'M2.75 6.25 4.9 8.4 9.25 3.9' : 'M3.5 3.5 8.5 8.5M8.5 3.5 3.5 8.5'}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

export function Card({
  children,
  className,
  ...rest
}: {
  children: ReactNode
  className?: string
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-[20px] bg-paper-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)]', className)}
      {...rest}
    >
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
  ...rest
}: {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  className?: string
} & HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'w-full rounded-full bg-navy px-4 py-3.5 text-[17px] font-semibold text-white transition active:scale-[0.98] disabled:opacity-40',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

export function GhostButton({
  children,
  onClick,
  className,
  ...rest
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
} & HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full rounded-full bg-white px-4 py-3 text-[17px] font-semibold text-ink shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition active:scale-[0.98]',
        className,
      )}
      {...rest}
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
