import { useLang } from '../i18n/LanguageContext'
import type { StringKey } from '../i18n/strings'
import type { PrepSession } from '../lib/session'
import pitchQr from '../assets/pitch-qr.png'

const POINTS: { title: StringKey; body: StringKey }[] = [
  { title: 'pitch.1t', body: 'pitch.1d' },
  { title: 'pitch.2t', body: 'pitch.2d' },
  { title: 'pitch.3t', body: 'pitch.3d' },
  { title: 'pitch.4t', body: 'pitch.4d' },
]

export function PitchRail({ session }: { session: PrepSession | null }) {
  const { t } = useLang()

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
      <div className="mt-auto pt-10">
        <div className="flex w-fit max-w-sm items-center gap-4 rounded-3xl bg-white/10 p-3 pr-5 ring-1 ring-white/10">
          <img
            src={pitchQr}
            alt={t('pitch.scan')}
            className="h-29 w-29 shrink-0 rounded-2xl bg-white p-1.5"
          />
          <div className="min-w-0">
            {session ? (
              <>
                <p className="font-display text-[22px] leading-[1.2] tracking-tight text-white">
                  {session.hospitalShort} · {session.slot.toUpperCase()}
                </p>
                <p className="mt-1 text-[15px] text-white/70">{session.date}</p>
                <p className="mt-3 text-[12px] leading-snug text-white/45">{t('pitch.scan')}</p>
              </>
            ) : (
              <p className="text-[15px] font-semibold leading-snug text-white/80">{t('pitch.scan')}</p>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
