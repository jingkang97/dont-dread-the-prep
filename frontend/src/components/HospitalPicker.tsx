import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown, ChevronRight, Hospital, Search } from 'lucide-react'
import {
  PICKER_CLUSTERS,
  clustersIn,
  matchHospital,
  pickerHospitalsFromApi,
  type PickerCluster,
  type PickerHospital,
} from '../data/hospitalPicker'
import { HOSPITAL_LOGOS } from '../data/hospitalLogos'
import type { HospitalId } from '../data/hospitals'
import { hospCopyOr } from '../i18n/keys'
import { useLang } from '../i18n/LanguageContext'
import { hospitalLiveCopy, usePrimeLiveCopy } from '../i18n/liveCopy'
import type { ApiHospital } from '../lib/api/hospitals'
import { cn } from '../lib/cn'
import { easeOut, fadeY } from '../lib/motion'

export function HospitalPicker({
  hospitals,
  onPick,
  loading = false,
}: {
  hospitals: ApiHospital[]
  onPick: (id: HospitalId) => void
  loading?: boolean
}) {
  const { t, tx } = useLang()
  const [query, setQuery] = useState('')
  const [openClusters, setOpenClusters] = useState<Set<PickerCluster>>(
    () => new Set(PICKER_CLUSTERS),
  )

  const catalog = useMemo(() => pickerHospitalsFromApi(hospitals), [hospitals])
  usePrimeLiveCopy(hospitals.flatMap(hospitalLiveCopy))
  const filtered = useMemo(
    () =>
      catalog.filter((h) =>
        matchHospital(h, query, hospCopyOr(t, h.hospitalId, 'name', '')),
      ),
    [catalog, query, t],
  )
  const clusters = useMemo(() => clustersIn(filtered), [filtered])

  function toggleCluster(c: PickerCluster) {
    setOpenClusters((prev) => {
      const next = new Set(prev)
      if (next.has(c)) next.delete(c)
      else next.add(c)
      return next
    })
  }

  return (
    <div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key="hospitals" {...fadeY}>
          {loading ? (
            <div className="mt-3 grid gap-2.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-[68px] animate-pulse rounded-[20px] bg-paper-2" />
              ))}
            </div>
          ) : (
            <>
              <label className="relative mt-3 block">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    if (e.target.value.trim()) setOpenClusters(new Set(PICKER_CLUSTERS))
                  }}
                  placeholder={t('on.pickerSearch')}
                  className="w-full rounded-2xl border border-transparent bg-paper-2 py-3.5 pr-3 pl-9 text-[16px] text-ink outline-none focus:border-navy"
                />
              </label>

              {filtered.length === 0 ? (
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
                          onPointerUp={(e) => e.currentTarget.blur()}
                          className="mb-1.5 flex w-full items-center gap-1 px-1 text-left outline-none focus:outline-none focus-visible:outline-none"
                        >
                          <span className="flex-1 text-[13px] font-bold text-ink">{tx(c)}</span>
                          <ChevronDown
                            size={16}
                            strokeWidth={2.5}
                            className={cn('text-ink transition-transform duration-200', open && 'rotate-180')}
                          />
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
                                  <HospitalRow
                                    key={h.key}
                                    h={h}
                                    onClick={() => onPick(h.hospitalId)}
                                  />
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </section>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function HospitalRow({
  h,
  onClick,
}: {
  h: PickerHospital
  onClick: () => void
}) {
  const { tx } = useLang()
  const name = h.name
  const logo = HOSPITAL_LOGOS[h.hospitalId]
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerUp={(e) => e.currentTarget.blur()}
      className="flex items-center gap-3 overflow-hidden rounded-[20px] bg-paper-2 px-4 py-3.5 text-left outline-none transition [-webkit-tap-highlight-color:transparent] focus:outline-none focus-visible:outline-none focus:ring-0"
    >
      {logo ? (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-[inset_0_0_0_1px_rgba(15,23,42,0.08)]">
          <img src={logo} alt="" className="h-full w-full object-contain p-1" />
        </span>
      ) : (
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
          style={{ background: h.accent }}
        >
          <Hospital size={18} />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-ink">{tx(h.short)}</span>
        <span className="block text-[12px] text-muted">{tx(name)}</span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-muted" />
    </button>
  )
}
