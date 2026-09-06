import { ArrowDown, ArrowUp } from 'lucide-react'
import { useLang } from '../../i18n/LanguageContext'

export type JumpDir = 'up' | 'down' | 'here'

export function JumpNextFab({
  dir,
  progress,
  onClick,
}: {
  dir: JumpDir
  progress: number
  onClick: () => void
}) {
  const { t } = useLang()
  const Icon = dir === 'up' ? ArrowUp : ArrowDown
  const r = 20
  const c = 2 * Math.PI * r
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1"
      aria-label={t('tl.jumpNext')}
    >
      <span className="whitespace-nowrap rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-bold tracking-tight text-ink shadow-[0_1px_8px_rgba(28,28,30,0.12)] backdrop-blur-md">
        {t('tl.jumpNext')}
      </span>
      <span className="relative grid h-[52px] w-[52px] place-items-center rounded-full bg-white shadow-[0_4px_18px_rgba(28,28,30,0.16)]">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 52 52" aria-hidden>
          <circle cx="26" cy="26" r={r} fill="none" stroke="#e8e8ed" strokeWidth="2.5" />
          <circle
            cx="26"
            cy="26"
            r={r}
            fill="none"
            stroke="#1c1c1e"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - progress)}
          />
        </svg>
        {dir === 'here' ? (
          <span className="h-3 w-3 rounded-full bg-teal" />
        ) : (
          <Icon size={22} strokeWidth={2.6} className="text-teal-deep" />
        )}
      </span>
    </button>
  )
}
