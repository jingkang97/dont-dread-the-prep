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
      <p className="font-display text-[22px] leading-tight tracking-tight text-ink">PEG</p>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
        PEG is used to clean out the gastrointestinal tract (stomach and intestines). You may experience diarrhoea, nausea and/or stomach cramps after taking the medication. Mix as shown below.
      </p>
      {imageSrc && (
        <img
          src={imageSrc}
          alt="How to mix PEG"
          className="mt-3 w-full rounded-2xl bg-navy-2"
        />
      )}
      <PrimaryButton className="mt-4" onClick={onClose}>
        {t('home.shortcutGotIt')}
      </PrimaryButton>
    </SheetFrame>
  )
}
