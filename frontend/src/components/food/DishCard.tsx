import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { ApiDish, ApiDishVerdict, ApiFoodClassification } from '../../lib/api'
import type { Verdict } from '../../data/foods'
import { useLang } from '../../i18n/LanguageContext'
import { cn } from '../../lib/cn'
import { easeOut } from '../../lib/motion'
import { Card, VerdictPill } from '../ui'

// Ingredients are Yes or No, never "Possible": anything the sheet has not
// cleared ('review' included) is shown as a No, i.e. something to leave out.
// "Possible" is a dish-level answer — see toDishVerdict.
function toIngredientVerdict(classification: ApiFoodClassification): Verdict {
  return classification === 'can' ? 'yes' : 'no'
}

// 'review' only reaches here for a dish with no ingredients on file; it reads
// as "Possible" rather than "Ask your care team", same wording as a dish the
// backend downgraded.
function toDishVerdict(verdict: ApiDishVerdict): Verdict {
  if (verdict === 'can') return 'yes'
  if (verdict === 'cannot') return 'no'
  return 'possible'
}

function Reason({ text }: { text: string }) {
  return <p className="mt-0.5 text-[12px] leading-snug text-muted">{text}</p>
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={cn('mt-1 shrink-0 text-muted transition-transform duration-200', open && 'rotate-180')}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      aria-hidden
    >
      <path
        d="M3 5.25 7 9.25l4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function DishCard({
  dish,
  hideApproved = false,
  collapsible = false,
}: {
  dish: ApiDish
  hideApproved?: boolean
  /**
   * Meal prep only: collapse the ingredient rows behind the dish name so a long
   * list scrolls as names. The chat cards (BotCard) leave this off and keep
   * rendering exactly as before — an answer to "can I eat this?" is the reason,
   * so it is never hidden behind a tap.
   */
  collapsible?: boolean
}) {
  const { t } = useLang()
  const [expanded, setExpanded] = useState(false)
  const dishVerdict = toDishVerdict(dish.verdict)
  const showDishPill = !(hideApproved && dishVerdict === 'yes')
  const details = (
    <>
      {dish.verdict === 'possible' && dish.remove_ingredients.length > 0 && (
        <p className="mt-1 text-[13px] font-medium text-possible">
          {t('food.possibleNote', { ingredients: dish.remove_ingredients.join(', ') })}
        </p>
      )}
      <div className="mt-2.5 grid gap-1.5">
        {dish.ingredients.map((ingredient) => {
          const verdict = toIngredientVerdict(ingredient.classification)
          const showPill = !(hideApproved && verdict === 'yes')
          return (
            <div
              key={ingredient.id}
              className="flex items-start justify-between gap-2 rounded-xl bg-paper px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-ink">{ingredient.name}</p>
                <Reason text={ingredient.classification_reason} />
              </div>
              {showPill ? <VerdictPill verdict={verdict} compact /> : null}
            </div>
          )
        })}
      </div>
    </>
  )

  return (
    <Card className="p-3.5">
      {collapsible ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-label={expanded ? t('food.hideIngredients') : t('food.showIngredients')}
          className="flex w-full items-start justify-between gap-2 text-left"
        >
          <p className="text-[16px] font-semibold text-ink">{dish.name}</p>
          <span className="flex shrink-0 items-start gap-1.5">
            {showDishPill ? <VerdictPill verdict={dishVerdict} /> : null}
            <Chevron open={expanded} />
          </span>
        </button>
      ) : (
        <div className="flex items-start justify-between gap-2">
          <p className="text-[16px] font-semibold text-ink">{dish.name}</p>
          {showDishPill ? <VerdictPill verdict={dishVerdict} /> : null}
        </div>
      )}
      {collapsible ? (
        <AnimatePresence initial={false}>
          {expanded && <AccordionPanel>{details}</AccordionPanel>}
        </AnimatePresence>
      ) : (
        details
      )}
    </Card>
  )
}

function AccordionPanel({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.28, ease: easeOut }}
      className="overflow-hidden"
    >
      {children}
    </motion.div>
  )
}
