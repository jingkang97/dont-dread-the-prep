import type { ApiDishChoice } from '../../lib/api'
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
    case 'choices':
      return 'food.choicesTitle'
    default:
      return 'food.notFoundTitle'
  }
}

export function BotCard({
  answer,
  onSelectChoice,
}: {
  answer: FoodChatAnswer
  onSelectChoice?: (choice: ApiDishChoice) => void
}) {
  const { t } = useLang()

  if (answer.status === 'ok' && answer.dish) {
    return <DishCard dish={answer.dish} />
  }

  if (answer.status === 'choices' && answer.choices?.length) {
    return (
      <Card className="p-3.5">
        {/* No verdict pill: this card asks which dish you meant, it does not answer. */}
        <p className="text-[16px] font-semibold text-ink">{t('food.choicesTitle')}</p>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
          {answer.message || t('food.choicesTitle')}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {answer.choices.map((choice) => (
            <button
              key={choice.id}
              type="button"
              onClick={() => onSelectChoice?.(choice)}
              className="rounded-full border border-line bg-paper px-3 py-1.5 text-[13px] font-medium text-navy"
            >
              {choice.name}
            </button>
          ))}
        </div>
      </Card>
    )
  }

  // Only 'not_found' is a clinical answer ("we have no line on this, ask someone").
  // 'multiple' / 'irrelevant' / 'not_configured' are input or plumbing problems,
  // so they carry no verdict pill.
  const showAskPill = answer.status === 'not_found'
  return (
    <Card className="p-3.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[16px] font-semibold text-ink">{t(statusTitleKey(answer.status))}</p>
        {showAskPill ? <VerdictPill verdict="ask" /> : null}
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
