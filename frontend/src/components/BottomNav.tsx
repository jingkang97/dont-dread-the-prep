import { CalendarClock, ClipboardList, Droplets, Phone, Utensils } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'
import type { StringKey } from '../i18n/strings'
import type { Screen } from '../lib/session'
import { cn } from '../lib/cn'

const ITEMS: { id: Screen; labelKey: StringKey; icon: typeof CalendarClock }[] = [
  { id: 'home', labelKey: 'nav.home', icon: ClipboardList },
  { id: 'timeline', labelKey: 'nav.timeline', icon: CalendarClock },
  { id: 'food', labelKey: 'nav.food', icon: Utensils },
  { id: 'stool', labelKey: 'nav.stool', icon: Droplets },
  { id: 'contacts', labelKey: 'nav.contacts', icon: Phone },
]

export function BottomNav({
  screen,
  onChange,
}: {
  screen: Screen
  onChange: (s: Screen) => void
}) {
  const { t } = useLang()
  return (
    <nav data-tour="bottom-nav" className="z-20 shrink-0 border-t border-black/5 bg-white/80 backdrop-blur-xl">
      <div className="grid grid-cols-5 px-1 pb-[max(6px,env(safe-area-inset-bottom))] pt-1">
        {ITEMS.map((item) => {
          const active = screen === item.id || (item.id === 'stool' && screen === 'reminders')
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                'flex h-12 w-full flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-medium leading-none transition-colors duration-200',
                active ? 'text-teal-deep' : 'text-muted',
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.3 : 1.7} />
              <span className="max-w-full truncate px-0.5">{t(item.labelKey)}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
