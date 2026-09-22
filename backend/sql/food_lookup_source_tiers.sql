-- Narrows food_source to the tiers a sheet is actually loaded for:
-- SKH, TTSH and the DIETICIAN baseline. SGH and CGH were carried as labels
-- but never held a row — a hospital without its own sheet is served the
-- DIETICIAN fallback in list_meal_prep()/find_dish() instead.
--
-- food_lookup.sql creates the narrowed type for a fresh install; this file is
-- for an existing database. Postgres cannot drop a label from an enum, so the
-- type is rebuilt and the two columns re-pointed at it.
--
-- Fails loudly rather than silently dropping data if a row still carries SGH
-- or CGH: the cast below has nothing to map them to.
--
-- Safe to re-run.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'food_source' AND e.enumlabel NOT IN ('SKH', 'TTSH', 'DIETICIAN')
  ) THEN
    ALTER TYPE food_source RENAME TO food_source_old;
    CREATE TYPE food_source AS ENUM ('SKH', 'TTSH', 'DIETICIAN');

    ALTER TABLE ingredient_tab
      ALTER COLUMN source_hospital TYPE food_source
      USING source_hospital::text::food_source;
    ALTER TABLE dishes_tab
      ALTER COLUMN source_hospital TYPE food_source
      USING source_hospital::text::food_source;

    DROP TYPE food_source_old;
  END IF;
END
$$;
