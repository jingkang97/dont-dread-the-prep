import { PrimaryButton } from '../ui'
import { SheetFrame } from '../sheets/SheetFrame'
import { useLang } from '../../i18n/LanguageContext'

const POSITIONS = [
  {
    src: '/timeline/fleet/left-side-position.png',
    title: 'Left-side position',
    body: 'Lie on left side, knee bent, and arms resting comfortably.',
  },
  {
    src: '/timeline/fleet/knee-chest-position.png',
    title: 'Knee-chest position',
    body: 'Kneel, then lower head and chest forward until the left side of your face is resting on the surface with left arm folded comfortably.',
  },
] as const

export function FleetMixSheet({ onClose }: { onClose: () => void }) {
  const { t, tx } = useLang()
  return (
    <SheetFrame onDismiss={onClose} dismissLabel={t('on.back')}>
      <p className="font-display text-[22px] leading-tight tracking-tight text-ink">{tx('Fleet Enema')}</p>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{tx('Position for using an enema:')}</p>
      <div className="mt-4 grid gap-4">
        {POSITIONS.map((pos) => (
          <figure key={pos.src}>
            <img src={pos.src} alt={tx(pos.title)} className="w-full rounded-2xl bg-navy-2" />
            <figcaption className="mt-2 text-[13px] leading-relaxed text-ink-soft">
              <span className="font-semibold text-ink">{tx(pos.title)}</span>
              {' — '}
              {tx(pos.body)}
            </figcaption>
          </figure>
        ))}
      </div>
      <PrimaryButton data-demo="sheet-done" className="mt-4" onClick={onClose}>
        {t('home.shortcutGotIt')}
      </PrimaryButton>
    </SheetFrame>
  )
}
