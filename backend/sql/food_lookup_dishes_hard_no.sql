-- Adds dishes_tab.hard_no / hard_no_reason to an already-migrated database.
-- food_lookup.sql carries the same columns for a fresh install.
--
-- A hard_no dish is refused on how it is cooked rather than on what goes into
-- it. Fried chicken is the case that motivated the column: chicken, oil, flour
-- and salt each classify as 'can' on the ingredient sheet, so the computed
-- verdict came out 'can' and meal-prep recommended it. No ingredient row can
-- express "deep-fried", so the dish carries the refusal itself.
--
-- Safe to re-run.

ALTER TABLE dishes_tab
  ADD COLUMN IF NOT EXISTS hard_no        BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hard_no_reason TEXT    NOT NULL DEFAULT '';

-- A reason without the flag would never be shown; reject that combination.
ALTER TABLE dishes_tab DROP CONSTRAINT IF EXISTS dishes_tab_hard_no_reason_needs_flag;
ALTER TABLE dishes_tab
  ADD CONSTRAINT dishes_tab_hard_no_reason_needs_flag
  CHECK (hard_no OR hard_no_reason = '');
