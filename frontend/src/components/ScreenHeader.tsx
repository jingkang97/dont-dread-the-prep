import type { ReactNode } from 'react'
import { SectionLabel } from './ui'
import { cn } from '../lib/cn'

export function ScreenHeader({
  kicker,
  title,
  lead,
  leadClassName = 'mt-2 text-[14px] leading-relaxed text-ink-soft',
  trailing,
}: {
  kicker?: string
  title: string
  lead?: ReactNode
  leadClassName?: string
  trailing?: ReactNode
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {kicker ? <SectionLabel>{kicker}</SectionLabel> : null}
          <h1 className={cn('font-display text-[28px] leading-tight text-navy', kicker && 'mt-1')}>
            {title}
          </h1>
        </div>
        {trailing}
      </div>
      {lead ? <p className={leadClassName}>{lead}</p> : null}
    </>
  )
}
