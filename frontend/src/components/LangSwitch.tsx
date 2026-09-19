import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Languages, LoaderCircle } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'
import { LANGS, type Lang } from '../i18n/strings'
import { cn } from '../lib/cn'

export function LangSwitch({
  className,
  variant = 'menu',
  compact = false,
}: {
  className?: string
  variant?: 'menu' | 'chips'
  compact?: boolean
}) {
  const { lang, setLang, t, translating } = useLang()
  const current = LANGS.find((item) => item.id === lang) ?? LANGS[0]

  if (variant === 'chips') {
    return (
      <div className={className}>
        <div
          role="radiogroup"
          aria-label={t('lang.choose')}
          aria-busy={translating}
          className="flex gap-1"
        >
          {LANGS.map((item) => {
            const on = item.id === lang
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={on}
                data-demo={`lang-${item.id}`}
                onClick={() => setLang(item.id)}
                className={cn(
                  'min-h-9 min-w-0 flex-1 whitespace-nowrap rounded-full px-2 text-[12px] font-medium',
                  on ? 'bg-teal-deep text-white' : 'bg-black/[0.06] text-navy',
                )}
              >
                {item.short}
              </button>
            )
          })}
        </div>
        {translating ? (
          <p className="mt-2.5 flex items-center gap-2 text-[13px] font-medium text-teal-deep">
            <LoaderCircle size={16} strokeWidth={2.4} className="shrink-0 animate-spin" />
            {t('lang.updating')}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <LangMenu
      className={className}
      current={current}
      lang={lang}
      setLang={setLang}
      label={translating ? t('lang.updating') : t('lang.choose')}
      translating={translating}
      compact={compact}
    />
  )
}

function LangMenu({
  className,
  current,
  lang,
  setLang,
  label,
  translating,
  compact,
}: {
  className?: string
  current: (typeof LANGS)[number]
  lang: Lang
  setLang: (lang: Lang) => void
  label: string
  translating: boolean
  compact: boolean
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointer(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className={cn('relative shrink-0', className)}>
      <button
        type="button"
        data-demo="lang-menu"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-busy={translating}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-11 items-center gap-1 rounded-full bg-black/[0.06] py-1 pl-2.5 pr-2 text-[13px] font-semibold text-navy"
      >
        <Languages size={15} strokeWidth={2.25} className="shrink-0 text-teal-deep" />
        <span>{compact ? current.short : current.native}</span>
        {translating ? (
          <LoaderCircle
            size={16}
            strokeWidth={2.4}
            className="shrink-0 animate-spin text-teal-deep"
          />
        ) : (
          <ChevronDown
            size={16}
            strokeWidth={2.5}
            className={cn('shrink-0 text-navy transition-transform duration-200', open && 'rotate-180')}
          />
        )}
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute right-0 z-50 mt-1 min-w-44 overflow-hidden rounded-2xl bg-white py-1 shadow-[0_8px_28px_rgba(0,0,0,0.12)] ring-1 ring-black/10"
        >
          {LANGS.map((item) => {
            const on = item.id === lang
            return (
              <li key={item.id} role="none">
                <button
                  type="button"
                  role="option"
                  data-demo={`lang-menu-${item.id}`}
                  aria-selected={on}
                  onClick={() => {
                    setLang(item.id)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-[15px] font-medium',
                    on ? 'bg-cream text-teal-deep' : 'text-navy active:bg-paper',
                  )}
                >
                  {item.native}
                  {on ? <Check size={16} strokeWidth={2.5} /> : null}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
