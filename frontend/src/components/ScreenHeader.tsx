import type { ReactNode } from 'react'
import { SectionLabel } from './ui'

export function ScreenHeader({
  kicker,
  title,
  lead,
  leadClassName = 'mt-2 text-[14px] leading-relaxed text-ink-soft',
  trailing,
}: {
  kicker: string
  title: string
  lead?: ReactNode
  leadClassName?: string
  trailing?: ReactNode
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <SectionLabel>{kicker}</SectionLabel>
          <h1 className="font-display mt-1 text-[28px] leading-tight text-navy">{title}</h1>
        </div>
        {trailing}
      </div>
      {lead ? <p className={leadClassName}>{lead}</p> : null}
    </>
  )
}
