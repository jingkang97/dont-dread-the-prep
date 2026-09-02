import { HOSPITALS } from '../data/hospitals'
import { useLang } from '../i18n/LanguageContext'
import type { StringKey } from '../i18n/strings'
import type { PrepSession } from '../lib/session'

const POINTS: { title: StringKey; body: StringKey }[] = [
  { title: 'pitch.1t', body: 'pitch.1d' },
  { title: 'pitch.2t', body: 'pitch.2d' },
  { title: 'pitch.3t', body: 'pitch.3d' },
  { title: 'pitch.4t', body: 'pitch.4d' },
  { title: 'pitch.5t', body: 'pitch.5d' },
]

export function PitchRail({ session }: { session: PrepSession | null }) {
  const { t } = useLang()
  const hospital = session ? HOSPITALS[session.hospitalId] : null

  return (
    <aside className="relative hidden min-h-0 overflow-y-auto bg-black px-12 py-14 text-white xl:flex xl:flex-col">
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-teal/25 blur-3xl" />
      <p className="text-[13px] font-semibold text-teal">{t('pitch.kicker')}</p>
      <h1 className="font-display mt-4 max-w-md text-[48px] leading-[1.15] tracking-tight">{t('pitch.title')}</h1>
      <p className="mt-4 max-w-md text-[16px] leading-relaxed text-white/60">{t('pitch.lead')}</p>
      <ol className="mt-10 max-w-sm space-y-3 text-[14px]">
        {POINTS.map((item, i) => (
          <li key={item.title} className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[12px] font-bold text-teal">
              {i + 1}
            </span>
            <span className="min-w-0">
              <span className="block font-semibold">{t(item.title)}</span>
              <span className="text-white/50">{t(item.body)}</span>
            </span>
          </li>
        ))}
      </ol>
      {session && hospital && (
        <div className="mt-auto max-w-sm rounded-[20px] bg-white/10 p-4 ring-1 ring-white/10">
          <p className="text-[12px] font-medium text-white/45">{t('pitch.live')}</p>
          <p className="font-display text-[28px] tracking-tight">{session.id}</p>
          <p className="text-[13px] text-white/55">
            {hospital.short} · {session.date} · {session.slot.toUpperCase()}
          </p>
        </div>
      )}
    </aside>
  )
}
