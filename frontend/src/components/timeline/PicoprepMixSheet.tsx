import { PrimaryButton } from '../ui'
import { SheetFrame } from '../sheets/SheetFrame'
import { useLang } from '../../i18n/LanguageContext'

export function PicoprepMixSheet({ onClose }: { onClose: () => void }) {
  const { t, tx } = useLang()
  return (
    <SheetFrame onDismiss={onClose} dismissLabel={t('on.back')}>
      <p className="font-display text-[22px] leading-tight tracking-tight text-ink">{tx('Picoprep')}</p>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
        {tx(
          'This is a drug (laxative) which stimulates the muscle in the intestines, in order to create bowel movements (pass motion). You may experience stomach cramps and diarrhoea after taking the medication. Mix as shown below.',
        )}
      </p>
      <img
        src="/timeline/picoprep-readiness.png"
        alt={tx('How to mix Picoprep')}
        className="mt-3 w-full rounded-2xl bg-navy-2"
      />
      <PrimaryButton data-demo="sheet-done" className="mt-4" onClick={onClose}>
        {t('home.shortcutGotIt')}
      </PrimaryButton>
    </SheetFrame>
  )
}
