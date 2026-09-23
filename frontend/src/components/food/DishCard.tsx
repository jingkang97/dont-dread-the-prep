import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { ApiDish, ApiFoodClassification } from '../../lib/api'
import type { Verdict } from '../../data/foods'
import { useLang } from '../../i18n/LanguageContext'
import { cn } from '../../lib/cn'
import { easeOut } from '../../lib/motion'
import { Card, VerdictMark } from '../ui'

// Ingredients are Yes or No, never "Possible": anything the sheet has not
// cleared ('review' included) is shown as a No, i.e. something to leave out.
function toIngredientVerdict(classification: ApiFoodClassification): Verdict {
  return classification === 'can' ? 'yes' : 'no'
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

// The qualifier ("no vegetables or garnishes") rides under the name rather than
// inside it: the name is what you scan for, the qualifier is what you check once
// you have found it. Only the hard-coded plans set dish.note.
function DishTitle({ dish }: { dish: ApiDish }) {
  const { tx } = useLang()
  return (
    <span className="min-w-0 text-left">
      <p className="text-[16px] font-semibold text-ink">{tx(dish.name)}</p>
      {dish.note ? <p className="mt-0.5 text-[12px] leading-snug text-muted">{tx(dish.note)}</p> : null}
    </span>
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
  const { t, tx } = useLang()
  const [expanded, setExpanded] = useState(false)
  // Only a hard_no keeps a dish-level mark. Every other dish is answered by
  // its ingredient marks and, where there is one, the note under the name —
  // the mark was repeating what the rows below it already said.
  const showDishMark = dish.hard_no
  const details = (
    <>
      {dish.hard_no && dish.hard_no_reason && (
        <p className="mt-1 text-[13px] font-medium text-no">{tx(dish.hard_no_reason)}</p>
      )}
      {dish.verdict === 'possible' && dish.remove_ingredients.length > 0 && (
        <p className="mt-1 text-[13px] font-medium text-possible">
          {t('food.possibleNote', { ingredients: dish.remove_ingredients.map((name) => tx(name)).join(', ') })}
        </p>
      )}
      {/* hard_no is a ruling on how the dish is cooked, not on what's in it —
          every ingredient below would still read 'can' on its own (see
          food.py _dish_verdict), which only contradicts the reason above.
          The ingredient rows exist to explain a verdict computed from them;
          a hard_no isn't one, so there is nothing for them to explain. */}
      {!dish.hard_no && (
        <div className="mt-2.5 grid gap-1.5">
          {dish.ingredients.map((ingredient) => {
            const verdict = toIngredientVerdict(ingredient.classification)
            const showMark = !(hideApproved && verdict === 'yes')
            return (
              <div
                key={ingredient.id}
                className="flex items-start justify-between gap-2 rounded-xl bg-paper px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-ink">{tx(ingredient.name)}</p>
                  <Reason text={tx(ingredient.classification_reason)} />
                </div>
                {showMark ? <VerdictMark verdict={verdict} /> : null}
              </div>
            )
          })}
        </div>
      )}
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
          data-demo="food-dish"
        >
          <DishTitle dish={dish} />
          <span className="flex shrink-0 items-start gap-1.5">
            {showDishMark ? <VerdictMark verdict="no" /> : null}
            <Chevron open={expanded} />
          </span>
        </button>
      ) : (
        <div className="flex items-start justify-between gap-2">
          <DishTitle dish={dish} />
          {showDishMark ? <VerdictMark verdict="no" /> : null}
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
