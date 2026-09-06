import { Phone } from 'lucide-react'
import { HOSPITALS, formatPhone, telHref } from '../data/hospitals'
import { STOOL_STAGES } from '../data/stool'
import { ScreenHeader } from '../components/ScreenHeader'
import { Card, PrimaryButton, SectionLabel } from '../components/ui'
import { hospContactKey, hospCopyKey, stoolStageKey } from '../i18n/keys'
import { useLang } from '../i18n/LanguageContext'
import type { PrepSession } from '../lib/session'
import { cn } from '../lib/cn'

export function StoolGuide({
  session,
  onReminders,
}: {
  session: PrepSession
  onReminders: () => void
}) {
  const { t } = useLang()
  const hospital = HOSPITALS[session.hospitalId]

  return (
    <div className="px-5 pb-10 pt-6">
      <ScreenHeader
        kicker={t('stool.kicker')}
        title={t('stool.title')}
        lead={t(hospCopyKey(hospital.id, 'stoolAction'))}
      />

      <div className="mt-5 grid gap-2">
        {STOOL_STAGES.map((stage) => (
          <Card key={stage.n} className="flex items-center gap-3 p-3">
            <Cup color={stage.color} clear={stage.n >= 5} />
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-ink">
                {stage.n}. {t(stoolStageKey(stage.n, 'n'))}
              </p>
              <p className="text-[12px] text-muted">{t(stoolStageKey(stage.n, 'l'))}</p>
            </div>
            <span
              className={cn(
                'rounded-full px-2 py-1 text-[10px] font-bold tracking-wide',
                stage.ready === 'ready' && 'bg-yes-bg text-yes',
                stage.ready === 'almost' && 'bg-ask-bg text-ask',
                stage.ready === 'not' && 'bg-no-bg text-no',
              )}
            >
              {stage.ready === 'ready' ? t('stool.ready') : stage.ready === 'almost' ? t('stool.almost') : t('stool.notReady')}
            </span>
          </Card>
        ))}
      </div>

      <Card className="mt-4 border-ask/30 bg-ask-bg/40 p-4">
        <p className="text-[14px] font-semibold text-ask">{t('stool.ifNotReady')}</p>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
          {t('stool.ifNotReadyBody', { hospital: hospital.short })}
        </p>
      </Card>

      <div className="mt-5">
        <SectionLabel>{t('stool.contactFor', { hospital: hospital.short })}</SectionLabel>
      </div>
      <p className="mt-1 text-[12px] leading-relaxed text-muted">{t(hospCopyKey(hospital.id, 'formGap'))}</p>

      <div className="mt-3 grid gap-2.5">
        {hospital.contacts.map((c, i) => (
          <Card key={c.phone} className="p-4">
            <p className="text-[12px] font-semibold tracking-wide text-muted">
              {t(hospContactKey(hospital.id, i, 'label'))}
            </p>
            <p className="font-display mt-0.5 text-[28px] text-navy">{formatPhone(c.phone)}</p>
            <p className="text-[12px] text-ink-soft">{t(hospContactKey(hospital.id, i, 'hours'))}</p>
            <p className="mt-2 text-[12px] leading-relaxed text-muted">
              {t(hospContactKey(hospital.id, i, 'note'))}
            </p>
            <a href={telHref(c.phone)}>
              <PrimaryButton className="mt-3">
                <span className="inline-flex items-center gap-2">
                  <Phone size={16} /> {t('stool.call', { phone: formatPhone(c.phone) })}
                </span>
              </PrimaryButton>
            </a>
          </Card>
        ))}
      </div>

      <button
        type="button"
        onClick={onReminders}
        className="mt-5 w-full text-center text-[13px] font-semibold text-teal-deep"
      >
        {t('stool.reminders')}
      </button>
    </div>
  )
}

function Cup({ color, clear }: { color: string; clear: boolean }) {
  return (
    <svg width="36" height="44" viewBox="0 0 36 44" aria-hidden>
      <path
        d="M6 4h24l-2.2 34.5a4 4 0 0 1-4 3.7H12.2a4 4 0 0 1-4-3.7L6 4Z"
        fill="#f7f1e4"
        stroke="#c9bfa8"
        strokeWidth="1.4"
      />
      <path
        d={
          clear
            ? 'M9.2 14h17.6l-1.5 22.2a2.6 2.6 0 0 1-2.6 2.4H13.3a2.6 2.6 0 0 1-2.6-2.4L9.2 14Z'
            : 'M8.6 8h18.8l-1.8 28.6a3 3 0 0 1-3 2.7h-9.2a3 3 0 0 1-3-2.7L8.6 8Z'
        }
        fill={color}
        opacity={clear ? 0.75 : 0.95}
      />
    </svg>
  )
}
