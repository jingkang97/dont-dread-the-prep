import type { FoodChatAnswer } from '../../lib/foodChat'
import { Card, VerdictPill } from '../ui'
import { useLang } from '../../i18n/LanguageContext'
import type { StringKey } from '../../i18n/strings'
import { DishCard } from './DishCard'

function statusTitleKey(status: FoodChatAnswer['status']): StringKey {
  switch (status) {
    case 'multiple':
      return 'food.multipleTitle'
    case 'irrelevant':
      return 'food.irrelevantTitle'
    case 'not_configured':
      return 'food.notConfiguredTitle'
    default:
      return 'food.notFoundTitle'
  }
}

export function BotCard({ answer }: { answer: FoodChatAnswer }) {
  const { t } = useLang()

  if (answer.status === 'ok' && answer.dish) {
    const footnote =
      answer.matchedSource === 'DIETICIAN'
        ? t('food.matchedDietician')
        : t('food.matchedHospital', { hospital: answer.matchedSource ?? '' })
    return <DishCard dish={answer.dish} footnote={footnote} />
  }

  return (
    <Card className="p-3.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[16px] font-semibold text-ink">{t(statusTitleKey(answer.status))}</p>
        <VerdictPill verdict="ask" />
      </div>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
        {answer.message || t('food.notFoundTitle')}
      </p>
    </Card>
  )
}

export function ThinkingCard() {
  const { t } = useLang()
  return (
    <Card className="p-3.5">
      <p className="text-[14px] leading-relaxed text-ink-soft">{t('food.thinking')}</p>
    </Card>
  )
}
