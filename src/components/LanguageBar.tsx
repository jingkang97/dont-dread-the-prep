import { LANGS } from '../i18n/strings'
import { useLang } from '../i18n/LanguageContext'
import { cn } from '../lib/cn'

export function LanguageBar() {
  const { lang, setLang, t } = useLang()
  return (
    <div className="shrink-0 bg-paper px-3 py-2">
      <span className="sr-only">{t('lang.choose')}</span>
      <div className="flex h-9 rounded-[10px] bg-black/5 p-[3px]">
        {LANGS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setLang(item.id)}
            className={cn(
              'flex min-w-0 flex-1 items-center justify-center rounded-[8px] px-1 text-[12px] font-semibold leading-none transition',
              lang === item.id ? 'bg-white text-ink shadow-sm' : 'text-muted',
            )}
          >
            {item.native}
          </button>
        ))}
      </div>
    </div>
  )
}
