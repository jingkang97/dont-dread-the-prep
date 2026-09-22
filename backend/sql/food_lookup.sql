-- Ingredient/dish lookup for the food chat + meal-prep feature.
-- Independent of protocols/hospitals — sourced per hospital sheet or a
-- consolidated dietitian baseline (DIETICIAN) used as a fallback.

-- Trigram similarity for fuzzy dish-name matching (chat falls back to this
-- when no exact name match exists, e.g. "century egg" -> "Century egg &
-- lean pork congee").
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TYPE food_classification AS ENUM ('can', 'cannot', 'review');
-- Only the hospitals with their own sheet get a tier; everyone else is served
-- the DIETICIAN baseline.
CREATE TYPE food_source AS ENUM ('SKH', 'TTSH', 'DIETICIAN');
CREATE TYPE dish_meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snack', 'drink');

CREATE TABLE ingredient_tab (
  id                     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name                   TEXT NOT NULL,
  classification         food_classification NOT NULL,
  classification_reason  TEXT NOT NULL DEFAULT '',
  source_hospital        food_source NOT NULL,
  source_document        TEXT NOT NULL DEFAULT '',
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (name, source_hospital)
);

CREATE TABLE dishes_tab (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name             TEXT NOT NULL,
  -- A dish can belong to more than one category, e.g. ['snack', 'drink'].
  meal_type        dish_meal_type[] NOT NULL DEFAULT '{}',
  source_hospital  food_source NOT NULL,
  -- [{"id": <ingredient_tab.id>, "name": "<ingredient_tab.name>"}, ...]
  ingredient_list  JSONB NOT NULL DEFAULT '[]',
  -- A dish refused on how it is cooked, not on what goes into it: deep-fried,
  -- oil-heavy. The ingredient rows cannot express this — every ingredient in
  -- fried chicken is individually fine — so the flag overrides the computed
  -- verdict to 'cannot'. hard_no_reason is the line shown on the dish card.
  hard_no          BOOLEAN NOT NULL DEFAULT false,
  hard_no_reason   TEXT NOT NULL DEFAULT '',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (name, source_hospital)
);

ALTER TABLE dishes_tab
  ADD CONSTRAINT dishes_tab_hard_no_reason_needs_flag
  CHECK (hard_no OR hard_no_reason = '');

CREATE INDEX ingredient_tab_name_idx ON ingredient_tab (lower(name));
CREATE INDEX dishes_tab_name_source_idx ON dishes_tab (lower(name), source_hospital);
CREATE INDEX dishes_tab_meal_type_gin_idx ON dishes_tab USING GIN (meal_type);
CREATE INDEX dishes_tab_source_hospital_idx ON dishes_tab (source_hospital);
CREATE INDEX dishes_tab_name_trgm_idx ON dishes_tab USING GIN (name gin_trgm_ops);
