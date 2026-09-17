import { PrimaryButton } from '../ui'
import { SheetFrame } from '../sheets/SheetFrame'
import { useLang } from '../../i18n/LanguageContext'

const ROWS = [
  {
    category: 'Blood-thinning medication',
    examples:
      'Aspirin (Cardiprin), Warfarin (Marevan), Clopidogrel (Placta), Ticlopidine (Ticlid), Dipyridamole (Perazodin), Rivaroxaban (Xarelto), Apixaban (Eliquis)',
    stop: "Follow your doctor's instructions",
  },
  {
    category: 'Possibly blood-thinning supplements',
    examples:
      "Echinacea, Ephedra, Garlic, Ginkgo (Tanakan), Ginseng, Valerian, Hypericum (St John's Wort), Kava (Kavain), Traditional Chinese Medicine (TCM), Ayurvedic, Jamu",
    stop: 'Stop 1 week before the procedure unless otherwise advised',
  },
  {
    category: 'Iron supplements',
    examples:
      'Ferrous Gluconate (Sangobion), Iron hydroxide polymaltose complex tablet and drops (Maltofer)',
    stop: 'Stop 1 week before the procedure unless otherwise advised',
  },
] as const

export function Med7dSheet({ onClose }: { onClose: () => void }) {
  const { t } = useLang()
  return (
    <SheetFrame onDismiss={onClose} dismissLabel={t('on.back')}>
      <div className="max-h-[min(80vh,640px)] overflow-y-auto overscroll-contain">
        <p className="font-display text-[22px] leading-tight tracking-tight text-ink">
          Medicines to review 7 days before
        </p>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
          Do not stop any medication unless your doctor or hospital has told you to. If unsure, ask your
          care team.
        </p>
        <div className="mt-4 grid gap-3">
          {ROWS.map((row) => (
            <div key={row.category} className="rounded-2xl bg-paper-2 px-3.5 py-3">
              <p className="text-[14px] font-semibold text-ink">{row.category}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-muted">{row.examples}</p>
              {/* <p className="mt-2 text-[13px] font-medium text-teal-deep">{row.stop}</p> */}
            </div>
          ))}
        </div>
        <PrimaryButton className="mt-4" onClick={onClose}>
          {t('home.shortcutGotIt')}
        </PrimaryButton>
      </div>
    </SheetFrame>
  )
}
