import { PrimaryButton } from '../ui'
import { SheetFrame } from '../sheets/SheetFrame'
import { useLang } from '../../i18n/LanguageContext'
import pegPrep from '../../assets/timeline/peg-prep.png'

export function PegMixSheet({ onClose }: { onClose: () => void }) {
  const { t } = useLang()
  return (
    <SheetFrame onDismiss={onClose} dismissLabel={t('on.back')}>
      <p className="font-display text-[22px] leading-tight tracking-tight text-ink">{t('tl.pegMixTitle')}</p>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{t('tl.pegWhy')}</p>
      <img
        src={pegPrep}
        alt={t('tl.pegMixImg')}
        className="mt-3 w-full rounded-2xl bg-navy-2"
      />
      <PrimaryButton className="mt-4" onClick={onClose}>
        {t('home.shortcutGotIt')}
      </PrimaryButton>
    </SheetFrame>
  )
}
