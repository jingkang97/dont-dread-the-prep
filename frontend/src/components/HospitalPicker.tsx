import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronRight, Hospital } from 'lucide-react'
import {
  canStartSession,
  hospitalsFor,
  type PickerHospital,
  type PickerSize,
} from '../data/hospitalPicker'
import type { HospitalId } from '../data/hospitals'
import { hospCopyKey } from '../i18n/keys'
import { useLang } from '../i18n/LanguageContext'
import { cn } from '../lib/cn'
import { fadeY } from '../lib/motion'
// Restore with Now / Future tabs:
// import { ChevronDown, Search } from 'lucide-react'
// import { PICKER_CLUSTERS, clustersIn, matchHospital, type PickerCluster } from '../data/hospitalPicker'
// import { easeOut } from '../lib/motion'
// import { SegmentedControl } from './SegmentedControl'
// const SIZES: { id: PickerSize; label: StringKey }[] = [
//   { id: 'now', label: 'on.pickerNow' },
//   { id: 'large', label: 'on.pickerLarge' },
// ]

export function HospitalPicker({
  selected,
  onPick,
  selectableIds,
}: {
  selected: HospitalId | null
  onPick: (id: HospitalId) => void
  /** When set, only these hospital ids create a real session; others show the preview note. */
  selectableIds?: HospitalId[] | null
}) {
  const { t } = useLang()
  const size: PickerSize = 'now'
  // const [size, setSize] = useState<PickerSize>('now')
  // const [query, setQuery] = useState('')
  // const [openClusters, setOpenClusters] = useState<Set<PickerCluster>>(() => new Set(PICKER_CLUSTERS))
  const [previewNote, setPreviewNote] = useState(false)

  const catalog = useMemo(() => hospitalsFor(size), [size])
  // const clusters = useMemo(() => clustersIn(catalog), [catalog])
  // const filtered = catalog.filter((h) => matchHospital(h, query))

  // function chooseSize(next: PickerSize) {
  //   setSize(next)
  //   setQuery('')
  //   setOpenClusters(new Set(PICKER_CLUSTERS))
  //   setPreviewNote(false)
  // }

  // function toggleCluster(c: PickerCluster) {
  //   setOpenClusters((prev) => {
  //     const next = new Set(prev)
  //     if (next.has(c)) next.delete(c)
  //     else next.add(c)
  //     return next
  //   })
  // }

  function choose(h: PickerHospital) {
    if (canStartSession(h, selectableIds)) {
      setPreviewNote(false)
      onPick(h.hospitalId)
      return
    }
    setPreviewNote(true)
  }

  return (
    <div>
      {/* Now / Future size tabs — restore when Future hospitals ship
      <p className="text-[12px] font-semibold text-muted">{t('on.pickerCompare')}</p>
      <SegmentedControl
        group="picker-size"
        value={size}
        onChange={chooseSize}
        className="mt-1.5"
        buttonClassName="py-1.5"
        options={SIZES.map(({ id, label }) => ({ id, label: t(label) }))}
      />
      */}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={size} {...fadeY}>
      {/* Future search — restore with Future tab
      {size !== 'now' && (
        <label className="relative mt-3 block">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPreviewNote(false)
              if (e.target.value.trim()) setOpenClusters(new Set(PICKER_CLUSTERS))
            }}
            placeholder={t('on.pickerSearch')}
            className="w-full rounded-2xl border border-transparent bg-paper-2 py-3.5 pr-3 pl-9 text-[16px] text-ink outline-none focus:border-navy"
          />
        </label>
      )}
      */}

      {previewNote && <p className="mt-2.5 text-[12px] leading-snug text-teal-deep">{t('on.pickerPreview')}</p>}

      {/* Future clustered list — restore with Future tab
      {size === 'large' ? (
        filtered.length === 0 ? (
          <p className="mt-3 px-1 text-[13px] text-ink-soft">{t('on.pickerEmpty')}</p>
        ) : (
          <div className="mt-3 grid gap-4">
            {clusters.map((c) => {
              const sites = filtered.filter((h) => h.cluster === c)
              if (!sites.length) return null
              const open = openClusters.has(c)
              return (
                <section key={c}>
                  <button
                    type="button"
                    onClick={() => toggleCluster(c)}
                    className="mb-1.5 flex w-full items-center gap-1 px-1 text-left outline-none focus:outline-none focus-visible:outline-none"
                  >
                    <span className="flex-1 text-[13px] font-bold text-ink">{c}</span>
                    <ChevronDown size={16} strokeWidth={2.5} className={cn('text-ink transition-transform duration-200', open && 'rotate-180')} />
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: easeOut }}
                        className="overflow-hidden"
                      >
                        <div className="grid gap-2.5">
                          {sites.map((h) => (
                            <HospitalRow key={h.key} h={h} selected={false} onClick={() => choose(h)} />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>
              )
            })}
          </div>
        )
      ) : (
      */}
        <div className="mt-3 grid gap-2.5">
          {catalog.map((h) => (
            <HospitalRow key={h.key} h={h} selected={h.hospitalId === selected} onClick={() => choose(h)} />
          ))}
        </div>
      {/* )} */}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function HospitalRow({
  h,
  selected,
  onClick,
}: {
  h: PickerHospital
  selected: boolean
  onClick: () => void
}) {
  const { t } = useLang()
  const name = h.hospitalId ? t(hospCopyKey(h.hospitalId, 'name')) : h.name
  const prep = h.hospitalId ? t(hospCopyKey(h.hospitalId, 'prep')) : h.prep
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-[20px] bg-paper-2 px-4 py-3.5 text-left outline-none transition',
        selected ? 'ring-2 ring-teal/40' : '',
      )}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
        style={{ background: h.accent }}
      >
        <Hospital size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-ink">{h.short}</span>
        <span className="block text-[12px] text-muted">
          {name} · {prep}
        </span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-muted" />
    </button>
  )
}
