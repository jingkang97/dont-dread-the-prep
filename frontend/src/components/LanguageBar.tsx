import { LANGS } from '../i18n/strings'
import { useLang } from '../i18n/LanguageContext'
import { SegmentedControl } from './SegmentedControl'

export function LanguageBar() {
  const { lang, setLang, t } = useLang()
  return (
    <div className="shrink-0 bg-paper px-3 py-2">
      <span className="sr-only">{t('lang.choose')}</span>
      <SegmentedControl
        group="lang"
        value={lang}
        onChange={setLang}
        className="h-9"
        buttonClassName="flex items-center justify-center text-[12px] leading-none"
        options={LANGS.map((item) => ({ id: item.id, label: item.native }))}
      />
    </div>
  )
}
