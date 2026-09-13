import { PrimaryButton } from '../ui'
import { SheetFrame } from '../sheets/SheetFrame'
import { useLang } from '../../i18n/LanguageContext'
import { resolvePrepImageSrc } from './prepImages'

export function PegMixSheet({
  onClose,
  prepImageLabel,
}: {
  onClose: () => void
  prepImageLabel?: string | null
}) {
  const { t } = useLang()
  const imageSrc = resolvePrepImageSrc(prepImageLabel)
  return (
    <SheetFrame onDismiss={onClose} dismissLabel={t('on.back')}>
      <p className="font-display text-[22px] leading-tight tracking-tight text-ink">{t('tl.pegMixTitle')}</p>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{t('tl.pegWhy')}</p>
      {imageSrc && (
        <img
          src={imageSrc}
          alt={t('tl.pegMixImg')}
          className="mt-3 w-full rounded-2xl bg-navy-2"
        />
      )}
      <PrimaryButton className="mt-4" onClick={onClose}>
        {t('home.shortcutGotIt')}
      </PrimaryButton>
    </SheetFrame>
  )
}
