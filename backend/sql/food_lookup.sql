-- Ingredient/dish lookup for the food chat + meal-prep feature.
-- Independent of protocols/hospitals — sourced per hospital sheet or a
-- consolidated dietitian baseline (DIETICIAN) used as a fallback.

CREATE TYPE food_classification AS ENUM ('can', 'cannot', 'review');
CREATE TYPE food_source AS ENUM ('SGH', 'TTSH', 'CGH', 'DIETICIAN');
CREATE TYPE dish_meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'any');

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
  meal_type        dish_meal_type NOT NULL DEFAULT 'any',
  source_hospital  food_source NOT NULL,
  -- [{"id": <ingredient_tab.id>, "name": "<ingredient_tab.name>"}, ...]
  ingredient_list  JSONB NOT NULL DEFAULT '[]',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (name, source_hospital)
);

CREATE INDEX ingredient_tab_name_idx ON ingredient_tab (lower(name));
CREATE INDEX dishes_tab_name_source_idx ON dishes_tab (lower(name), source_hospital);
CREATE INDEX dishes_tab_meal_source_idx ON dishes_tab (meal_type, source_hospital);
