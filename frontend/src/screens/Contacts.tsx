import { Phone } from 'lucide-react'
import { formatPhone, telHref } from '../data/hospitals'
import { Card, PrimaryButton } from '../components/ui'
import { useLang } from '../i18n/LanguageContext'
import { useSessionHospital } from '../hooks/useSessionHospital'
import type { PrepSession } from '../lib/session'

export function Contacts({ session }: { session: PrepSession }) {
  const { t, tx } = useLang()
  const { hospital, loading, error } = useSessionHospital(session)
  const contacts = hospital?.contacts ?? []

  return (
    <div className="px-5 pb-10 pt-4">
      {!loading && contacts.length === 0 ? (
        <p className="text-[14px] text-no">{tx(error ?? t('err.hospitals'))}</p>
      ) : null}
      <div className="grid gap-2.5">
        {contacts.map((c) => (
          <Card key={c.phone} className="p-4">
            <p className="text-[12px] font-semibold tracking-wide text-muted">{tx(c.label)}</p>
            <p className="font-display mt-0.5 text-[28px] text-navy">{formatPhone(c.phone)}</p>
            {c.hours ? <p className="text-[12px] text-ink-soft">{tx(c.hours)}</p> : null}
            {c.note ? <p className="mt-2 text-[12px] leading-relaxed text-muted">{tx(c.note)}</p> : null}
            <a href={telHref(c.phone)}>
              <PrimaryButton className="mt-3">
                <span className="inline-flex items-center gap-2">
                  <Phone size={16} /> {t('contacts.call', { phone: formatPhone(c.phone) })}
                </span>
              </PrimaryButton>
            </a>
          </Card>
        ))}
      </div>
    </div>
  )
}
