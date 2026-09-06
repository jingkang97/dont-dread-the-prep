import type { ChatAnswer } from '../../data/foods'
import { Card, SourceLine, VerdictPill } from '../ui'
import { useLang } from '../../i18n/LanguageContext'

export function BotCard({ answer }: { answer: ChatAnswer }) {
  const { t } = useLang()
  const title = answer.titleKey ? t(answer.titleKey, answer.bodyVars) : answer.title
  const body = [
    answer.bodyKey ? t(answer.bodyKey, answer.bodyVars) : answer.body,
    answer.hospital ? t('food.forHospital', { hospital: answer.hospital }) : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Card className="p-3.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[16px] font-semibold text-ink">{title}</p>
        <VerdictPill verdict={answer.verdict} />
      </div>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{body}</p>
      {answer.split && (
        <div className="mt-3 grid gap-2">
          {answer.split.map((part) => (
            <div key={part.titleKey} className="flex items-start justify-between gap-2 rounded-xl bg-paper px-3 py-2">
              <div>
                <p className="text-[13px] font-semibold text-ink">{t(part.titleKey)}</p>
                <p className="text-[12px] text-muted">{t(part.bodyKey)}</p>
              </div>
              <VerdictPill verdict={part.verdict} compact />
            </div>
          ))}
        </div>
      )}
      <SourceLine text={answer.source} rules={answer.rules} />
    </Card>
  )
}
