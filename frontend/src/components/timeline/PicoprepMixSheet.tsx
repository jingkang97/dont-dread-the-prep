import { PrimaryButton } from '../ui'
import { SheetFrame } from '../sheets/SheetFrame'
import { useLang } from '../../i18n/LanguageContext'
export function PicoprepMixSheet({ onClose }: { onClose: () => void }) {
  const { t } = useLang()
  return (
    <SheetFrame onDismiss={onClose} dismissLabel={t('on.back')}>
      <p className="font-display text-[22px] leading-tight tracking-tight text-ink">{t('tl.mixTitle')}</p>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{t('tl.picoprepWhy')}</p>
      <img
        src="/timeline/picoprep-readiness.png"
        alt={t('tl.mixImg')}
        className="mt-3 w-full rounded-2xl bg-navy-2"
      />
      <PrimaryButton className="mt-4" onClick={onClose}>
        {t('home.shortcutGotIt')}
      </PrimaryButton>
    </SheetFrame>
  )
}
