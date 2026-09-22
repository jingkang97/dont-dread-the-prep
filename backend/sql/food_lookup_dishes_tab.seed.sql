-- Seed for dishes_tab — regenerated against the Sept 18 2026 ingredient sheet.
-- Companion to food_lookup_ingredient_tab.seed.sql; run that file FIRST.
--
-- Row counts
--   225 DIETICIAN + 58 TTSH + 58 SKH = 341 dishes
-- The DIETICIAN and TTSH rows are the previous dish set (food_lookup_uat.seed.sql)
-- carried over unchanged. The SKH tier is new: it mirrors the TTSH dish list, so
-- an SKH patient gets those dishes scored against SKH's own ingredient rows
-- instead of the DIETICIAN baseline. The other 225 dishes still reach SKH
-- patients through the DIETICIAN fallback in list_meal_prep().
--
-- ingredient_list holds the literal ingredient_tab ids written by
-- food_lookup_ingredient_tab.seed.sql (DIETICIAN 1..167, SKH 168..300,
-- TTSH 301..383). The two files are generated together: renumbering the
-- ingredient ids invalidates every id below, so regenerate both or neither.
-- Each id was resolved on the dish's own tier where the sheet carries the
-- ingredient, otherwise on DIETICIAN — the same precedence list_meal_prep()
-- uses at query time.
--
-- Ingredient resolution against the Sept 18 sheet, per tier
--   DIETICIAN  225 dishes, 131 distinct ingredient names: 116 on tier,  0 via DIETICIAN, 15 unresolved
--   TTSH        58 dishes,  58 distinct ingredient names:  29 on tier, 18 via DIETICIAN, 11 unresolved
--   SKH         58 dishes,  58 distinct ingredient names:  38 on tier, 11 via DIETICIAN,  9 unresolved
--
-- A name the sheet no longer carries is stored as {"id": null, "name": "..."} —
-- the shape the previous seed already used — and _resolve_ingredients() skips it.
--
-- 33 dishes (13 DIETICIAN, 11 TTSH, 9 SKH) resolve to nothing at all: their only
-- ingredient is a name the sheet dropped. An empty list reads as 'review' in
-- _dish_verdict(), so they are never recommended by list_meal_prep(), which only
-- surfaces 'can'. They are kept rather than dropped so the dish list stays a
-- superset of the previous one; delete them if you would rather they not show up
-- in chat lookups at all.
--
-- 43 DIETICIAN dishes resolve only PARTIALLY — Kaya toast keeps White bread but
-- loses Butter, Century egg porridge keeps six of seven. _resolve_ingredients()
-- skips a null id, so those dishes are judged on the ingredients that survived:
-- Kaya toast computes 'can' on white bread alone and is recommended for
-- breakfast. Either add the missing names to the ingredient sheet, or make
-- _dish_verdict() treat an unresolved ingredient as a no. Until one of those
-- happens, the affected dishes are the weak spot in this file.
--
-- Ingredient names the Sept 18 sheet no longer carries, by tier
--   DIETICIAN  Beef, Butter, Calamansi drink, Chin chow drink, Coconut flesh, Coconut water, Cooking oil, Duck, Mutton / lamb, Plain prata, Pork, Sugarcane juice, Tempeh, Unlisted extras (recipe varies), Vegetarian mock meat
--   TTSH       Bandung, Butter, Coconut flesh, Cooking oil, Plain biscuits, Plain crackers, Plain naan, Plain pancake, Plain prata, Plain waffle, Rice cereal
--   SKH        Bandung, Butter, Coconut flesh, Cooking oil, Plain crackers, Plain naan, Plain pancake, Plain prata, Plain waffle
--
-- hard_no — refused on how the dish is cooked, not on what goes into it
--   34 rows (29 distinct dish names) carry hard_no = true, which forces
--   verdict 'cannot' in _dish_verdict() whatever the ingredients say. Fried
--   chicken is the case that motivated it: chicken, oil, flour and salt each
--   classify 'can' on the sheet, so the dish computed to 'can' and meal-prep
--   recommended it. 30 of the 34 flagged rows were not 'cannot' before the flag.
--
--   Deep-fried / oil-heavy:
--     Begedil, Cereal prawns, Chai tow kway / carrot cake, Char kway teow,
--     Chicken chop, Fish and chips, Fried chicken, Fried rice, Hokkien mee,
--     Indian mee goreng, Malay mee goreng, Ngoh hiang, Otah, Samosa,
--     Tandoori chicken, Vadai
--   Griddled in oil or ghee (flagged even when plain):
--     Appam, Chapati, Cheese prata, Egg prata, Idiyappam / putu mayam,
--     Murtabak, Naan, Onion prata, Plain naan, Plain pancake, Plain prata,
--     Plain waffle, Thosai / dosa
--
--   THIS LIST IS NOT CLINICALLY VALIDATED. It is a first pass over dish names;
--   a dietitian should confirm both the membership and the wording of
--   hard_no_reason, which is patient-facing. Adding or removing a dish is a
--   one-line edit here — no id bookkeeping is involved.
--
-- Requires: hard_no / hard_no_reason on dishes_tab. food_lookup.sql has them
-- for a fresh install; an existing database needs food_lookup_dishes_hard_no.sql
-- run first.
--
-- Two names were rewritten to match the sheet:
--   "Apple juice (clear, no pulp)" -> "Apple juice"
--   "Pear juice (clear, no pulp)"  -> "Pear juice"
--
-- ingredient_list was rebuilt on Sept 22 2026. An earlier revision of this file
-- carried one ingredient per dish — every list truncated to its first entry, so
-- Century egg porridge read as white porridge and nothing else. The lists here
-- are the pre-truncation ones, re-resolved to the ids above; the 100 composite
-- dishes (2-10 ingredients) are back.
--
-- Safe to re-run.

DELETE FROM dishes_tab;

INSERT INTO dishes_tab (name, meal_type, source_hospital, ingredient_list, hard_no, hard_no_reason)
VALUES
    -- --- DIETICIAN tier (225 dishes) ---
  ('Potato', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 109, "name": "Potato"}]'::jsonb, false, ''),
  ('Sweet potato', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 140, "name": "Sweet potato"}]'::jsonb, false, ''),
  ('Yam / taro', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 164, "name": "Yam / taro"}]'::jsonb, false, ''),
  ('Pork', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": null, "name": "Pork"}]'::jsonb, false, ''),
  ('Beef', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": null, "name": "Beef"}]'::jsonb, false, ''),
  ('Mutton / lamb', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": null, "name": "Mutton / lamb"}]'::jsonb, false, ''),
  ('Duck', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": null, "name": "Duck"}]'::jsonb, false, ''),
  ('Fishball', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 48, "name": "Fishball"}]'::jsonb, false, ''),
  ('Fishcake', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 49, "name": "Fishcake"}]'::jsonb, false, ''),
  ('Sausage', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 121, "name": "Sausage"}]'::jsonb, false, ''),
  ('Luncheon meat', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 82, "name": "Luncheon meat"}]'::jsonb, false, ''),
  ('Vegetarian mock meat', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": null, "name": "Vegetarian mock meat"}]'::jsonb, false, ''),
  ('Tofu', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 147, "name": "Tofu"}]'::jsonb, false, ''),
  ('Taukwa', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 142, "name": "Taukwa"}]'::jsonb, false, ''),
  ('Tau pok', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 141, "name": "Tau pok"}]'::jsonb, false, ''),
  ('Tempeh', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": null, "name": "Tempeh"}]'::jsonb, false, ''),
  ('Soybeans', ARRAY['lunch', 'dinner', 'snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 133, "name": "Soybeans"}]'::jsonb, false, ''),
  ('Red beans', ARRAY['lunch', 'dinner', 'snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 118, "name": "Red beans"}]'::jsonb, false, ''),
  ('Mung beans', ARRAY['lunch', 'dinner', 'snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 91, "name": "Mung beans"}]'::jsonb, false, ''),
  ('Chickpeas', ARRAY['lunch', 'dinner', 'snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 25, "name": "Chickpeas"}]'::jsonb, false, ''),
  ('Lentils', ARRAY['lunch', 'dinner', 'snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 80, "name": "Lentils"}]'::jsonb, false, ''),
  ('Peas', ARRAY['lunch', 'dinner', 'snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 105, "name": "Peas"}]'::jsonb, false, ''),
  ('Peanuts', ARRAY['lunch', 'dinner', 'snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 102, "name": "Peanuts"}]'::jsonb, false, ''),
  ('Sesame seeds', ARRAY['lunch', 'dinner', 'snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 123, "name": "Sesame seeds"}]'::jsonb, false, ''),
  ('Chia seeds', ARRAY['lunch', 'dinner', 'snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 23, "name": "Chia seeds"}]'::jsonb, false, ''),
  ('Flax seeds', ARRAY['lunch', 'dinner', 'snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 50, "name": "Flax seeds"}]'::jsonb, false, ''),
  ('Sunflower seeds', ARRAY['lunch', 'dinner', 'snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 138, "name": "Sunflower seeds"}]'::jsonb, false, ''),
  ('Pumpkin seeds', ARRAY['lunch', 'dinner', 'snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 115, "name": "Pumpkin seeds"}]'::jsonb, false, ''),
  ('Mixed nuts', ARRAY['lunch', 'dinner', 'snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 89, "name": "Mixed nuts"}]'::jsonb, false, ''),
  ('Smooth peanut butter', ARRAY['lunch', 'dinner', 'snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 128, "name": "Smooth peanut butter"}]'::jsonb, false, ''),
  ('Cucumber', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 39, "name": "Cucumber"}]'::jsonb, false, ''),
  ('Tomato', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 148, "name": "Tomato"}]'::jsonb, false, ''),
  ('Carrot', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 19, "name": "Carrot"}]'::jsonb, false, ''),
  ('Pumpkin', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 114, "name": "Pumpkin"}]'::jsonb, false, ''),
  ('Cabbage', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 18, "name": "Cabbage"}]'::jsonb, false, ''),
  ('Chye sim', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 27, "name": "Chye sim"}]'::jsonb, false, ''),
  ('Kai lan', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 70, "name": "Kai lan"}]'::jsonb, false, ''),
  ('Kang kong', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 71, "name": "Kang kong"}]'::jsonb, false, ''),
  ('Spinach', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 134, "name": "Spinach"}]'::jsonb, false, ''),
  ('Lettuce', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 81, "name": "Lettuce"}]'::jsonb, false, ''),
  ('Bean sprouts', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 7, "name": "Bean sprouts"}]'::jsonb, false, ''),
  ('Broccoli', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 14, "name": "Broccoli"}]'::jsonb, false, ''),
  ('Cauliflower', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 20, "name": "Cauliflower"}]'::jsonb, false, ''),
  ('French beans', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 51, "name": "French beans"}]'::jsonb, false, ''),
  ('Okra', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 95, "name": "Okra"}]'::jsonb, false, ''),
  ('Eggplant', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 45, "name": "Eggplant"}]'::jsonb, false, ''),
  ('Bitter gourd', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 10, "name": "Bitter gourd"}]'::jsonb, false, ''),
  ('Mushrooms', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 92, "name": "Mushrooms"}]'::jsonb, false, ''),
  ('Seaweed', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 122, "name": "Seaweed"}]'::jsonb, false, ''),
  ('Onion', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 96, "name": "Onion"}]'::jsonb, false, ''),
  ('Garlic', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 56, "name": "Garlic"}]'::jsonb, false, ''),
  ('Ginger', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 57, "name": "Ginger"}]'::jsonb, false, ''),
  ('Chilli', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 26, "name": "Chilli"}]'::jsonb, false, ''),
  ('Spring onion', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 135, "name": "Spring onion"}]'::jsonb, false, ''),
  ('Coriander', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 36, "name": "Coriander"}]'::jsonb, false, ''),
  ('Laksa leaves', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 77, "name": "Laksa leaves"}]'::jsonb, false, ''),
  ('Lemongrass', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 79, "name": "Lemongrass"}]'::jsonb, false, ''),
  ('Fried shallots', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 54, "name": "Fried shallots"}]'::jsonb, false, ''),
  ('Corn', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 37, "name": "Corn"}]'::jsonb, false, ''),
  ('Soy sauce', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 132, "name": "Soy sauce"}]'::jsonb, false, ''),
  ('Dark soy sauce', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 42, "name": "Dark soy sauce"}]'::jsonb, false, ''),
  ('Oyster sauce', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 99, "name": "Oyster sauce"}]'::jsonb, false, ''),
  ('Tomato ketchup', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 150, "name": "Tomato ketchup"}]'::jsonb, false, ''),
  ('Sweet chilli sauce', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 139, "name": "Sweet chilli sauce"}]'::jsonb, false, ''),
  ('Sambal', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 120, "name": "Sambal"}]'::jsonb, false, ''),
  ('Curry paste', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 40, "name": "Curry paste"}]'::jsonb, false, ''),
  ('Laksa paste', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 78, "name": "Laksa paste"}]'::jsonb, false, ''),
  ('Banana', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 4, "name": "Banana"}]'::jsonb, false, ''),
  ('Papaya', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 100, "name": "Papaya"}]'::jsonb, false, ''),
  ('Watermelon', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 154, "name": "Watermelon"}]'::jsonb, false, ''),
  ('Apple', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 2, "name": "Apple"}]'::jsonb, false, ''),
  ('Orange', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 97, "name": "Orange"}]'::jsonb, false, ''),
  ('Pineapple', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 106, "name": "Pineapple"}]'::jsonb, false, ''),
  ('Mango', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 83, "name": "Mango"}]'::jsonb, false, ''),
  ('Guava', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 61, "name": "Guava"}]'::jsonb, false, ''),
  ('Pear', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 103, "name": "Pear"}]'::jsonb, false, ''),
  ('Grapes', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 60, "name": "Grapes"}]'::jsonb, false, ''),
  ('Berries', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 9, "name": "Berries"}]'::jsonb, false, ''),
  ('Dried fruit', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 43, "name": "Dried fruit"}]'::jsonb, false, ''),
  ('Raisins', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 117, "name": "Raisins"}]'::jsonb, false, ''),
  ('Prunes', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 112, "name": "Prunes"}]'::jsonb, false, ''),
  ('Honeydew', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 64, "name": "Honeydew"}]'::jsonb, false, ''),
  ('Water', ARRAY['drink']::dish_meal_type[], 'DIETICIAN', '[{"id": 153, "name": "Water"}]'::jsonb, false, ''),
  ('Clear chicken broth', ARRAY['drink']::dish_meal_type[], 'DIETICIAN', '[{"id": 28, "name": "Clear chicken broth"}]'::jsonb, false, ''),
  ('Clear fish broth', ARRAY['drink']::dish_meal_type[], 'DIETICIAN', '[{"id": 29, "name": "Clear fish broth"}]'::jsonb, false, ''),
  ('Colourless soft drink', ARRAY['drink']::dish_meal_type[], 'DIETICIAN', '[{"id": 34, "name": "Colourless soft drink"}]'::jsonb, false, ''),
  ('Glucose drink', ARRAY['drink']::dish_meal_type[], 'DIETICIAN', '[{"id": 58, "name": "Glucose drink"}]'::jsonb, false, ''),
  ('Honey water', ARRAY['drink']::dish_meal_type[], 'DIETICIAN', '[{"id": 63, "name": "Honey water"}]'::jsonb, false, ''),
  ('Apple juice (clear, no pulp)', ARRAY['drink']::dish_meal_type[], 'DIETICIAN', '[{"id": 3, "name": "Apple juice"}]'::jsonb, false, ''),
  ('Pear juice (clear, no pulp)', ARRAY['drink']::dish_meal_type[], 'DIETICIAN', '[{"id": 104, "name": "Pear juice"}]'::jsonb, false, ''),
  ('Orange juice', ARRAY['drink']::dish_meal_type[], 'DIETICIAN', '[{"id": 98, "name": "Orange juice"}]'::jsonb, false, ''),
  ('Sugarcane juice', ARRAY['drink']::dish_meal_type[], 'DIETICIAN', '[{"id": null, "name": "Sugarcane juice"}]'::jsonb, false, ''),
  ('Calamansi drink', ARRAY['drink']::dish_meal_type[], 'DIETICIAN', '[{"id": null, "name": "Calamansi drink"}]'::jsonb, false, ''),
  ('Coconut water', ARRAY['drink']::dish_meal_type[], 'DIETICIAN', '[{"id": null, "name": "Coconut water"}]'::jsonb, false, ''),
  ('Grape juice', ARRAY['drink']::dish_meal_type[], 'DIETICIAN', '[{"id": 59, "name": "Grape juice"}]'::jsonb, false, ''),
  ('Prune juice', ARRAY['drink']::dish_meal_type[], 'DIETICIAN', '[{"id": 111, "name": "Prune juice"}]'::jsonb, false, ''),
  ('Tomato juice', ARRAY['drink']::dish_meal_type[], 'DIETICIAN', '[{"id": 149, "name": "Tomato juice"}]'::jsonb, false, ''),
  ('Milo', ARRAY['drink']::dish_meal_type[], 'DIETICIAN', '[{"id": 88, "name": "Milo"}]'::jsonb, false, ''),
  ('Horlicks', ARRAY['drink']::dish_meal_type[], 'DIETICIAN', '[{"id": 65, "name": "Horlicks"}]'::jsonb, false, ''),
  ('Isotonic drink (light-coloured)', ARRAY['drink']::dish_meal_type[], 'DIETICIAN', '[{"id": 66, "name": "Isotonic drink (light-coloured)"}]'::jsonb, false, ''),
  ('Isotonic drink (red/purple/blue)', ARRAY['drink']::dish_meal_type[], 'DIETICIAN', '[{"id": 67, "name": "Isotonic drink (red/purple/blue)"}]'::jsonb, false, ''),
  ('Chin chow drink', ARRAY['drink']::dish_meal_type[], 'DIETICIAN', '[{"id": null, "name": "Chin chow drink"}]'::jsonb, false, ''),
  ('Jelly', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 68, "name": "Jelly"}]'::jsonb, false, ''),
  ('Agar-agar', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 1, "name": "Agar-agar"}]'::jsonb, false, ''),
  ('Chicken rice', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 157, "name": "White rice"}, {"id": 24, "name": "Chicken"}, {"id": 39, "name": "Cucumber"}, {"id": 26, "name": "Chilli"}, {"id": 132, "name": "Soy sauce"}, {"id": 54, "name": "Fried shallots"}]'::jsonb, false, ''),
  ('Roasted chicken rice', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 157, "name": "White rice"}, {"id": 24, "name": "Chicken"}, {"id": 39, "name": "Cucumber"}, {"id": 132, "name": "Soy sauce"}, {"id": 26, "name": "Chilli"}, {"id": 54, "name": "Fried shallots"}]'::jsonb, false, ''),
  ('Steamed chicken rice', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 157, "name": "White rice"}, {"id": 24, "name": "Chicken"}, {"id": 39, "name": "Cucumber"}, {"id": 132, "name": "Soy sauce"}, {"id": 26, "name": "Chilli"}, {"id": 54, "name": "Fried shallots"}]'::jsonb, false, ''),
  ('Roast duck rice', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 157, "name": "White rice"}, {"id": null, "name": "Duck"}, {"id": 39, "name": "Cucumber"}, {"id": 42, "name": "Dark soy sauce"}]'::jsonb, false, ''),
  ('Char siu rice', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 157, "name": "White rice"}, {"id": null, "name": "Pork"}, {"id": 39, "name": "Cucumber"}]'::jsonb, false, ''),
  ('Economic rice / cai png', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 157, "name": "White rice"}, {"id": null, "name": "Unlisted extras (recipe varies)"}]'::jsonb, false, ''),
  ('Fried rice', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 157, "name": "White rice"}, {"id": 44, "name": "Egg"}, {"id": 105, "name": "Peas"}, {"id": 135, "name": "Spring onion"}]'::jsonb, true, 'Deep-fried — the oil makes this unsuitable for prep no matter what goes into it.'),
  ('Char kway teow', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 76, "name": "Kway teow"}, {"id": 44, "name": "Egg"}, {"id": 110, "name": "Prawns"}, {"id": 49, "name": "Fishcake"}, {"id": 7, "name": "Bean sprouts"}, {"id": 135, "name": "Spring onion"}, {"id": 42, "name": "Dark soy sauce"}, {"id": 26, "name": "Chilli"}]'::jsonb, true, 'Deep-fried — the oil makes this unsuitable for prep no matter what goes into it.'),
  ('Hokkien mee', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 165, "name": "Yellow noodles"}, {"id": 8, "name": "Bee hoon"}, {"id": 110, "name": "Prawns"}, {"id": 136, "name": "Squid"}, {"id": null, "name": "Pork"}, {"id": 7, "name": "Bean sprouts"}, {"id": 135, "name": "Spring onion"}, {"id": 120, "name": "Sambal"}]'::jsonb, true, 'Deep-fried — the oil makes this unsuitable for prep no matter what goes into it.'),
  ('Prawn mee', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 165, "name": "Yellow noodles"}, {"id": 8, "name": "Bee hoon"}, {"id": 110, "name": "Prawns"}, {"id": null, "name": "Pork"}, {"id": 7, "name": "Bean sprouts"}, {"id": 71, "name": "Kang kong"}, {"id": 26, "name": "Chilli"}, {"id": 54, "name": "Fried shallots"}]'::jsonb, false, ''),
  ('Fishball noodles', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 86, "name": "Mee pok"}, {"id": 85, "name": "Mee kia"}, {"id": 48, "name": "Fishball"}, {"id": 49, "name": "Fishcake"}, {"id": 81, "name": "Lettuce"}, {"id": 7, "name": "Bean sprouts"}, {"id": 26, "name": "Chilli"}, {"id": 135, "name": "Spring onion"}]'::jsonb, false, ''),
  ('Bak chor mee', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 86, "name": "Mee pok"}, {"id": 85, "name": "Mee kia"}, {"id": null, "name": "Pork"}, {"id": 48, "name": "Fishball"}, {"id": 92, "name": "Mushrooms"}, {"id": 81, "name": "Lettuce"}, {"id": 26, "name": "Chilli"}, {"id": 135, "name": "Spring onion"}, {"id": 54, "name": "Fried shallots"}]'::jsonb, false, ''),
  ('Wanton noodles', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 165, "name": "Yellow noodles"}, {"id": null, "name": "Pork"}, {"id": 27, "name": "Chye sim"}, {"id": 26, "name": "Chilli"}, {"id": 135, "name": "Spring onion"}]'::jsonb, false, ''),
  ('Lor mee', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 165, "name": "Yellow noodles"}, {"id": 44, "name": "Egg"}, {"id": 49, "name": "Fishcake"}, {"id": null, "name": "Pork"}, {"id": 7, "name": "Bean sprouts"}, {"id": 26, "name": "Chilli"}, {"id": 36, "name": "Coriander"}, {"id": 56, "name": "Garlic"}]'::jsonb, false, ''),
  ('Beef hor fun', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 76, "name": "Kway teow"}, {"id": null, "name": "Beef"}, {"id": 70, "name": "Kai lan"}, {"id": 27, "name": "Chye sim"}, {"id": 135, "name": "Spring onion"}]'::jsonb, false, ''),
  ('Sliced fish bee hoon', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 8, "name": "Bee hoon"}, {"id": 47, "name": "Fish"}, {"id": 148, "name": "Tomato"}, {"id": 52, "name": "Fresh milk"}, {"id": 54, "name": "Fried shallots"}]'::jsonb, false, ''),
  ('Fish soup', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 157, "name": "White rice"}, {"id": 47, "name": "Fish"}, {"id": 148, "name": "Tomato"}, {"id": 28, "name": "Clear chicken broth"}, {"id": 54, "name": "Fried shallots"}, {"id": 135, "name": "Spring onion"}]'::jsonb, false, ''),
  ('Chicken soup', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 157, "name": "White rice"}, {"id": 24, "name": "Chicken"}, {"id": 28, "name": "Clear chicken broth"}, {"id": null, "name": "Unlisted extras (recipe varies)"}]'::jsonb, false, ''),
  ('Congee', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN', '[{"id": 156, "name": "White porridge"}, {"id": 135, "name": "Spring onion"}, {"id": 57, "name": "Ginger"}, {"id": 132, "name": "Soy sauce"}, {"id": 54, "name": "Fried shallots"}]'::jsonb, false, ''),
  ('Fish porridge', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN', '[{"id": 156, "name": "White porridge"}, {"id": 47, "name": "Fish"}, {"id": 135, "name": "Spring onion"}, {"id": 57, "name": "Ginger"}, {"id": 132, "name": "Soy sauce"}, {"id": 54, "name": "Fried shallots"}]'::jsonb, false, ''),
  ('Chicken porridge', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN', '[{"id": 156, "name": "White porridge"}, {"id": 24, "name": "Chicken"}, {"id": 135, "name": "Spring onion"}, {"id": 57, "name": "Ginger"}, {"id": 132, "name": "Soy sauce"}, {"id": 54, "name": "Fried shallots"}]'::jsonb, false, ''),
  ('Century egg porridge', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN', '[{"id": 156, "name": "White porridge"}, {"id": 44, "name": "Egg"}, {"id": null, "name": "Pork"}, {"id": 135, "name": "Spring onion"}, {"id": 57, "name": "Ginger"}, {"id": 132, "name": "Soy sauce"}, {"id": 54, "name": "Fried shallots"}]'::jsonb, false, ''),
  ('Claypot rice', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 157, "name": "White rice"}, {"id": 24, "name": "Chicken"}, {"id": 121, "name": "Sausage"}, {"id": 92, "name": "Mushrooms"}, {"id": 27, "name": "Chye sim"}, {"id": 42, "name": "Dark soy sauce"}, {"id": 135, "name": "Spring onion"}]'::jsonb, false, ''),
  ('Bak kut teh', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 157, "name": "White rice"}, {"id": null, "name": "Pork"}, {"id": 56, "name": "Garlic"}, {"id": 36, "name": "Coriander"}]'::jsonb, false, ''),
  ('Pig organ soup', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 157, "name": "White rice"}, {"id": null, "name": "Pork"}, {"id": 135, "name": "Spring onion"}]'::jsonb, false, ''),
  ('Steamed fish', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 157, "name": "White rice"}, {"id": 47, "name": "Fish"}, {"id": 57, "name": "Ginger"}, {"id": 135, "name": "Spring onion"}, {"id": 132, "name": "Soy sauce"}, {"id": 36, "name": "Coriander"}]'::jsonb, false, ''),
  ('Sweet and sour fish', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 157, "name": "White rice"}, {"id": 47, "name": "Fish"}, {"id": 96, "name": "Onion"}, {"id": 106, "name": "Pineapple"}]'::jsonb, false, ''),
  ('Black pepper beef', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 157, "name": "White rice"}, {"id": null, "name": "Beef"}, {"id": 96, "name": "Onion"}]'::jsonb, false, ''),
  ('Beef noodles', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 165, "name": "Yellow noodles"}, {"id": null, "name": "Beef"}, {"id": 135, "name": "Spring onion"}]'::jsonb, false, ''),
  ('Kway chap', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 76, "name": "Kway teow"}, {"id": null, "name": "Pork"}, {"id": 42, "name": "Dark soy sauce"}, {"id": 54, "name": "Fried shallots"}]'::jsonb, false, ''),
  ('Roast meats platter', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 157, "name": "White rice"}, {"id": null, "name": "Pork"}, {"id": null, "name": "Duck"}, {"id": 24, "name": "Chicken"}, {"id": 39, "name": "Cucumber"}]'::jsonb, false, ''),
  ('Har gow', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 110, "name": "Prawns"}, {"id": null, "name": "Unlisted extras (recipe varies)"}]'::jsonb, false, ''),
  ('Siew mai', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": null, "name": "Pork"}, {"id": 110, "name": "Prawns"}, {"id": null, "name": "Unlisted extras (recipe varies)"}]'::jsonb, false, ''),
  ('Chee cheong fun', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 132, "name": "Soy sauce"}, {"id": 123, "name": "Sesame seeds"}, {"id": 54, "name": "Fried shallots"}]'::jsonb, false, ''),
  ('Chai tow kway / carrot cake', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 44, "name": "Egg"}, {"id": 135, "name": "Spring onion"}, {"id": 42, "name": "Dark soy sauce"}, {"id": 132, "name": "Soy sauce"}, {"id": 26, "name": "Chilli"}]'::jsonb, true, 'Deep-fried — the oil makes this unsuitable for prep no matter what goes into it.'),
  ('Popiah', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 44, "name": "Egg"}, {"id": 110, "name": "Prawns"}, {"id": 81, "name": "Lettuce"}, {"id": 7, "name": "Bean sprouts"}, {"id": 102, "name": "Peanuts"}, {"id": 26, "name": "Chilli"}, {"id": 54, "name": "Fried shallots"}]'::jsonb, false, ''),
  ('Rojak', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 147, "name": "Tofu"}, {"id": null, "name": "Cooking oil"}, {"id": 39, "name": "Cucumber"}, {"id": 106, "name": "Pineapple"}, {"id": 102, "name": "Peanuts"}]'::jsonb, false, ''),
  ('Satay', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 24, "name": "Chicken"}, {"id": null, "name": "Pork"}, {"id": null, "name": "Beef"}, {"id": null, "name": "Mutton / lamb"}, {"id": 39, "name": "Cucumber"}, {"id": 96, "name": "Onion"}, {"id": 102, "name": "Peanuts"}]'::jsonb, false, ''),
  ('Chilli crab', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 124, "name": "Shellfish"}, {"id": 26, "name": "Chilli"}, {"id": 148, "name": "Tomato"}, {"id": 150, "name": "Tomato ketchup"}]'::jsonb, false, ''),
  ('Cereal prawns', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": null, "name": "Cooking oil"}, {"id": 110, "name": "Prawns"}, {"id": 26, "name": "Chilli"}, {"id": null, "name": "Butter"}]'::jsonb, true, 'Deep-fried — the oil makes this unsuitable for prep no matter what goes into it.'),
  ('Ngoh hiang', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": null, "name": "Pork"}, {"id": 110, "name": "Prawns"}, {"id": 96, "name": "Onion"}]'::jsonb, true, 'Deep-fried — the oil makes this unsuitable for prep no matter what goes into it.'),
  ('Nasi lemak', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 157, "name": "White rice"}, {"id": 33, "name": "Coconut milk"}, {"id": 44, "name": "Egg"}, {"id": 24, "name": "Chicken"}, {"id": 47, "name": "Fish"}, {"id": 39, "name": "Cucumber"}, {"id": 102, "name": "Peanuts"}, {"id": 120, "name": "Sambal"}]'::jsonb, false, ''),
  ('Nasi padang', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 157, "name": "White rice"}, {"id": 40, "name": "Curry paste"}, {"id": 120, "name": "Sambal"}]'::jsonb, false, ''),
  ('Mee rebus', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 165, "name": "Yellow noodles"}, {"id": 44, "name": "Egg"}, {"id": 7, "name": "Bean sprouts"}, {"id": 27, "name": "Chye sim"}, {"id": 140, "name": "Sweet potato"}, {"id": 26, "name": "Chilli"}, {"id": 54, "name": "Fried shallots"}, {"id": 135, "name": "Spring onion"}]'::jsonb, false, ''),
  ('Mee siam', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 8, "name": "Bee hoon"}, {"id": 44, "name": "Egg"}, {"id": 110, "name": "Prawns"}, {"id": 7, "name": "Bean sprouts"}, {"id": 135, "name": "Spring onion"}, {"id": 40, "name": "Curry paste"}]'::jsonb, false, ''),
  ('Malay mee goreng', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 165, "name": "Yellow noodles"}, {"id": 44, "name": "Egg"}, {"id": 24, "name": "Chicken"}, {"id": 18, "name": "Cabbage"}, {"id": 148, "name": "Tomato"}, {"id": 139, "name": "Sweet chilli sauce"}, {"id": 135, "name": "Spring onion"}]'::jsonb, true, 'Deep-fried — the oil makes this unsuitable for prep no matter what goes into it.'),
  ('Ayam penyet', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 157, "name": "White rice"}, {"id": 24, "name": "Chicken"}, {"id": null, "name": "Cooking oil"}, {"id": 39, "name": "Cucumber"}, {"id": 18, "name": "Cabbage"}, {"id": 120, "name": "Sambal"}]'::jsonb, false, ''),
  ('Ayam bakar', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 157, "name": "White rice"}, {"id": 24, "name": "Chicken"}, {"id": 39, "name": "Cucumber"}, {"id": 81, "name": "Lettuce"}, {"id": 120, "name": "Sambal"}]'::jsonb, false, ''),
  ('Mee soto', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 165, "name": "Yellow noodles"}, {"id": 24, "name": "Chicken"}, {"id": 7, "name": "Bean sprouts"}, {"id": 26, "name": "Chilli"}, {"id": 135, "name": "Spring onion"}, {"id": 54, "name": "Fried shallots"}]'::jsonb, false, ''),
  ('Soto ayam', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 165, "name": "Yellow noodles"}, {"id": 24, "name": "Chicken"}, {"id": 7, "name": "Bean sprouts"}, {"id": 18, "name": "Cabbage"}, {"id": 26, "name": "Chilli"}, {"id": 54, "name": "Fried shallots"}]'::jsonb, false, ''),
  ('Lontong', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 44, "name": "Egg"}, {"id": 18, "name": "Cabbage"}, {"id": 51, "name": "French beans"}, {"id": 33, "name": "Coconut milk"}, {"id": 120, "name": "Sambal"}]'::jsonb, false, ''),
  ('Sup tulang', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 155, "name": "White bread"}, {"id": 157, "name": "White rice"}, {"id": null, "name": "Mutton / lamb"}, {"id": 96, "name": "Onion"}, {"id": 148, "name": "Tomato"}, {"id": 40, "name": "Curry paste"}]'::jsonb, false, ''),
  ('Beef rendang', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 157, "name": "White rice"}, {"id": null, "name": "Beef"}, {"id": 33, "name": "Coconut milk"}, {"id": 40, "name": "Curry paste"}]'::jsonb, false, ''),
  ('Chicken rendang', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 157, "name": "White rice"}, {"id": 24, "name": "Chicken"}, {"id": 33, "name": "Coconut milk"}, {"id": 40, "name": "Curry paste"}]'::jsonb, false, ''),
  ('Assam fish', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 157, "name": "White rice"}, {"id": 47, "name": "Fish"}, {"id": 95, "name": "Okra"}, {"id": 148, "name": "Tomato"}, {"id": 26, "name": "Chilli"}]'::jsonb, false, ''),
  ('Otah', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 47, "name": "Fish"}, {"id": 26, "name": "Chilli"}, {"id": 33, "name": "Coconut milk"}, {"id": 40, "name": "Curry paste"}]'::jsonb, true, 'Deep-fried — the oil makes this unsuitable for prep no matter what goes into it.'),
  ('Begedil', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 109, "name": "Potato"}, {"id": 44, "name": "Egg"}, {"id": null, "name": "Pork"}, {"id": 96, "name": "Onion"}]'::jsonb, true, 'Deep-fried — the oil makes this unsuitable for prep no matter what goes into it.'),
  ('Egg prata', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN', '[{"id": null, "name": "Plain prata"}, {"id": 44, "name": "Egg"}, {"id": 40, "name": "Curry paste"}]'::jsonb, true, 'Cooked in oil or ghee on the griddle — too rich for prep even when plain.'),
  ('Onion prata', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN', '[{"id": null, "name": "Plain prata"}, {"id": 96, "name": "Onion"}, {"id": 40, "name": "Curry paste"}]'::jsonb, true, 'Cooked in oil or ghee on the griddle — too rich for prep even when plain.'),
  ('Cheese prata', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN', '[{"id": null, "name": "Plain prata"}, {"id": 22, "name": "Cheese"}, {"id": 40, "name": "Curry paste"}]'::jsonb, true, 'Cooked in oil or ghee on the griddle — too rich for prep even when plain.'),
  ('Thosai / dosa', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN', '[{"id": 80, "name": "Lentils"}]'::jsonb, true, 'Cooked in oil or ghee on the griddle — too rich for prep even when plain.'),
  ('Idli', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN', '[{"id": 80, "name": "Lentils"}]'::jsonb, false, ''),
  ('Idiyappam / putu mayam', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN', '[{"id": 8, "name": "Bee hoon"}, {"id": 33, "name": "Coconut milk"}, {"id": null, "name": "Coconut flesh"}]'::jsonb, true, 'Cooked in oil or ghee on the griddle — too rich for prep even when plain.'),
  ('Appam', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN', '[{"id": 33, "name": "Coconut milk"}]'::jsonb, true, 'Cooked in oil or ghee on the griddle — too rich for prep even when plain.'),
  ('Naan', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 155, "name": "White bread"}, {"id": null, "name": "Butter"}]'::jsonb, true, 'Cooked in oil or ghee on the griddle — too rich for prep even when plain.'),
  ('Tandoori chicken', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 24, "name": "Chicken"}, {"id": 166, "name": "Yoghurt"}]'::jsonb, true, 'Deep-fried — the oil makes this unsuitable for prep no matter what goes into it.'),
  ('Biryani', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 157, "name": "White rice"}, {"id": 24, "name": "Chicken"}, {"id": null, "name": "Mutton / lamb"}, {"id": 96, "name": "Onion"}, {"id": 166, "name": "Yoghurt"}, {"id": null, "name": "Cooking oil"}]'::jsonb, false, ''),
  ('Murtabak', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": null, "name": "Mutton / lamb"}, {"id": 24, "name": "Chicken"}, {"id": 96, "name": "Onion"}, {"id": 40, "name": "Curry paste"}]'::jsonb, true, 'Cooked in oil or ghee on the griddle — too rich for prep even when plain.'),
  ('Indian mee goreng', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 165, "name": "Yellow noodles"}, {"id": 44, "name": "Egg"}, {"id": null, "name": "Pork"}, {"id": 18, "name": "Cabbage"}, {"id": 148, "name": "Tomato"}, {"id": 26, "name": "Chilli"}, {"id": 150, "name": "Tomato ketchup"}, {"id": 135, "name": "Spring onion"}]'::jsonb, true, 'Deep-fried — the oil makes this unsuitable for prep no matter what goes into it.'),
  ('Fish curry', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 157, "name": "White rice"}, {"id": 47, "name": "Fish"}, {"id": 95, "name": "Okra"}, {"id": 148, "name": "Tomato"}, {"id": 96, "name": "Onion"}, {"id": 40, "name": "Curry paste"}]'::jsonb, false, ''),
  ('Chicken curry', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 157, "name": "White rice"}, {"id": 24, "name": "Chicken"}, {"id": 109, "name": "Potato"}, {"id": 96, "name": "Onion"}, {"id": 40, "name": "Curry paste"}]'::jsonb, false, ''),
  ('Fish head curry', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 157, "name": "White rice"}, {"id": 47, "name": "Fish"}, {"id": 95, "name": "Okra"}, {"id": 45, "name": "Eggplant"}, {"id": 148, "name": "Tomato"}, {"id": 40, "name": "Curry paste"}]'::jsonb, false, ''),
  ('Dhal', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 80, "name": "Lentils"}]'::jsonb, false, ''),
  ('Samosa', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 109, "name": "Potato"}, {"id": 105, "name": "Peas"}]'::jsonb, true, 'Deep-fried — the oil makes this unsuitable for prep no matter what goes into it.'),
  ('Vadai', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 80, "name": "Lentils"}]'::jsonb, true, 'Deep-fried — the oil makes this unsuitable for prep no matter what goes into it.'),
  ('Laksa', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 8, "name": "Bee hoon"}, {"id": 110, "name": "Prawns"}, {"id": 49, "name": "Fishcake"}, {"id": 44, "name": "Egg"}, {"id": 7, "name": "Bean sprouts"}, {"id": 39, "name": "Cucumber"}, {"id": 33, "name": "Coconut milk"}, {"id": 78, "name": "Laksa paste"}, {"id": 26, "name": "Chilli"}, {"id": 77, "name": "Laksa leaves"}]'::jsonb, false, ''),
  ('Chicken buah keluak', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 157, "name": "White rice"}, {"id": 24, "name": "Chicken"}, {"id": 89, "name": "Mixed nuts"}, {"id": 40, "name": "Curry paste"}]'::jsonb, false, ''),
  ('Chap chye', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 157, "name": "White rice"}, {"id": 147, "name": "Tofu"}, {"id": 42, "name": "Dark soy sauce"}]'::jsonb, false, ''),
  ('Ayam pongteh', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 157, "name": "White rice"}, {"id": 24, "name": "Chicken"}, {"id": 109, "name": "Potato"}, {"id": 133, "name": "Soybeans"}]'::jsonb, false, ''),
  ('Kaya toast', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN', '[{"id": 155, "name": "White bread"}, {"id": 72, "name": "Kaya"}, {"id": null, "name": "Butter"}]'::jsonb, false, ''),
  ('Ice kacang', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 102, "name": "Peanuts"}, {"id": 68, "name": "Jelly"}, {"id": 37, "name": "Corn"}]'::jsonb, false, ''),
  ('Chendol', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 118, "name": "Red beans"}, {"id": 33, "name": "Coconut milk"}, {"id": 68, "name": "Jelly"}]'::jsonb, false, ''),
  ('Bubur cha cha', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 140, "name": "Sweet potato"}, {"id": 164, "name": "Yam / taro"}, {"id": 33, "name": "Coconut milk"}]'::jsonb, false, ''),
  ('Red bean soup', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 118, "name": "Red beans"}]'::jsonb, false, ''),
  ('Green bean soup', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 91, "name": "Mung beans"}]'::jsonb, false, ''),
  ('Peanut soup', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 102, "name": "Peanuts"}]'::jsonb, false, ''),
  ('Tau huay', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 147, "name": "Tofu"}, {"id": null, "name": "Unlisted extras (recipe varies)"}]'::jsonb, false, ''),
  ('Mango pudding', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 83, "name": "Mango"}, {"id": 52, "name": "Fresh milk"}, {"id": 38, "name": "Cream"}]'::jsonb, false, ''),
  ('Onde-onde', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": null, "name": "Coconut flesh"}]'::jsonb, false, ''),
  ('Ang ku kueh', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 91, "name": "Mung beans"}, {"id": 102, "name": "Peanuts"}, {"id": null, "name": "Cooking oil"}]'::jsonb, false, ''),
  ('Steamed rice kueh (plain)', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": null, "name": "Unlisted extras (recipe varies)"}]'::jsonb, false, ''),
  ('Clear broth', ARRAY['drink', 'lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 28, "name": "Clear chicken broth"}, {"id": 29, "name": "Clear fish broth"}]'::jsonb, false, ''),
  ('Milo drink', ARRAY['drink']::dish_meal_type[], 'DIETICIAN', '[{"id": 88, "name": "Milo"}]'::jsonb, false, ''),
  ('Horlicks drink', ARRAY['drink']::dish_meal_type[], 'DIETICIAN', '[{"id": 65, "name": "Horlicks"}]'::jsonb, false, ''),
  ('Apple juice', ARRAY['drink']::dish_meal_type[], 'DIETICIAN', '[{"id": 3, "name": "Apple juice"}]'::jsonb, false, ''),
  ('Pear juice', ARRAY['drink']::dish_meal_type[], 'DIETICIAN', '[{"id": 104, "name": "Pear juice"}]'::jsonb, false, ''),
  ('Chin chow', ARRAY['drink']::dish_meal_type[], 'DIETICIAN', '[{"id": null, "name": "Chin chow drink"}]'::jsonb, false, ''),
  ('Isotonic drink (light colour)', ARRAY['drink']::dish_meal_type[], 'DIETICIAN', '[{"id": 66, "name": "Isotonic drink (light-coloured)"}]'::jsonb, false, ''),
  ('Soft drink (colourless)', ARRAY['drink']::dish_meal_type[], 'DIETICIAN', '[{"id": 34, "name": "Colourless soft drink"}]'::jsonb, false, ''),
  ('Jelly dessert', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 68, "name": "Jelly"}]'::jsonb, false, ''),
  ('Agar-agar dessert', ARRAY['snack']::dish_meal_type[], 'DIETICIAN', '[{"id": 1, "name": "Agar-agar"}]'::jsonb, false, ''),
  ('Plain toast', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN', '[{"id": 155, "name": "White bread"}]'::jsonb, false, ''),
  ('Soft-boiled eggs', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN', '[{"id": 44, "name": "Egg"}, {"id": 132, "name": "Soy sauce"}]'::jsonb, false, ''),
  ('Mee sua soup', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 87, "name": "Mee sua"}, {"id": 24, "name": "Chicken"}, {"id": 47, "name": "Fish"}, {"id": 44, "name": "Egg"}, {"id": 28, "name": "Clear chicken broth"}, {"id": 135, "name": "Spring onion"}]'::jsonb, false, ''),
  ('Kway teow soup', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 76, "name": "Kway teow"}, {"id": 48, "name": "Fishball"}, {"id": 49, "name": "Fishcake"}, {"id": 7, "name": "Bean sprouts"}, {"id": 81, "name": "Lettuce"}, {"id": 28, "name": "Clear chicken broth"}, {"id": 135, "name": "Spring onion"}]'::jsonb, false, ''),
  ('Bee hoon soup', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 8, "name": "Bee hoon"}, {"id": 24, "name": "Chicken"}, {"id": 47, "name": "Fish"}, {"id": 28, "name": "Clear chicken broth"}, {"id": 135, "name": "Spring onion"}]'::jsonb, false, ''),
  ('Yong tau foo soup', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 165, "name": "Yellow noodles"}, {"id": 147, "name": "Tofu"}, {"id": 49, "name": "Fishcake"}, {"id": 28, "name": "Clear chicken broth"}, {"id": 135, "name": "Spring onion"}]'::jsonb, false, ''),
  ('Yong tau foo dry', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 165, "name": "Yellow noodles"}, {"id": 147, "name": "Tofu"}, {"id": 49, "name": "Fishcake"}, {"id": 139, "name": "Sweet chilli sauce"}]'::jsonb, false, ''),
  ('Wonton soup', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": null, "name": "Pork"}, {"id": 110, "name": "Prawns"}, {"id": 28, "name": "Clear chicken broth"}, {"id": 135, "name": "Spring onion"}]'::jsonb, false, ''),
  ('Plain steamed egg', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 44, "name": "Egg"}, {"id": 132, "name": "Soy sauce"}]'::jsonb, false, ''),
  ('Omelette', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 44, "name": "Egg"}, {"id": 96, "name": "Onion"}, {"id": null, "name": "Cooking oil"}]'::jsonb, false, ''),
  ('Fried chicken', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 24, "name": "Chicken"}, {"id": null, "name": "Cooking oil"}]'::jsonb, true, 'Deep-fried — the oil makes this unsuitable for prep no matter what goes into it.'),
  ('Steamed tofu', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 147, "name": "Tofu"}, {"id": 135, "name": "Spring onion"}, {"id": 132, "name": "Soy sauce"}, {"id": 54, "name": "Fried shallots"}]'::jsonb, false, ''),
  ('Braised tofu', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 147, "name": "Tofu"}, {"id": 92, "name": "Mushrooms"}, {"id": 42, "name": "Dark soy sauce"}]'::jsonb, false, ''),
  ('Plain pasta', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 101, "name": "Pasta"}, {"id": null, "name": "Cooking oil"}, {"id": null, "name": "Butter"}]'::jsonb, false, ''),
  ('Cream pasta', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 101, "name": "Pasta"}, {"id": 24, "name": "Chicken"}, {"id": 92, "name": "Mushrooms"}, {"id": 38, "name": "Cream"}]'::jsonb, false, ''),
  ('Tomato pasta', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 101, "name": "Pasta"}, {"id": 24, "name": "Chicken"}, {"id": 148, "name": "Tomato"}, {"id": 96, "name": "Onion"}, {"id": 150, "name": "Tomato ketchup"}]'::jsonb, false, ''),
  ('Fish and chips', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 109, "name": "Potato"}, {"id": 47, "name": "Fish"}, {"id": null, "name": "Cooking oil"}]'::jsonb, true, 'Deep-fried — the oil makes this unsuitable for prep no matter what goes into it.'),
  ('Chicken chop', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 109, "name": "Potato"}, {"id": 157, "name": "White rice"}, {"id": 24, "name": "Chicken"}, {"id": 81, "name": "Lettuce"}]'::jsonb, true, 'Deep-fried — the oil makes this unsuitable for prep no matter what goes into it.'),
  ('Chicken noodle soup', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 165, "name": "Yellow noodles"}, {"id": 24, "name": "Chicken"}, {"id": 19, "name": "Carrot"}, {"id": 28, "name": "Clear chicken broth"}]'::jsonb, false, ''),
  ('Plain rice noodles', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN', '[{"id": 8, "name": "Bee hoon"}]'::jsonb, false, ''),

    -- --- TTSH tier (58 dishes) ---
  ('White rice', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'TTSH', '[{"id": 380, "name": "White rice"}]'::jsonb, false, ''),
  ('White porridge', ARRAY['breakfast']::dish_meal_type[], 'TTSH', '[{"id": 379, "name": "White porridge"}]'::jsonb, false, ''),
  ('Bee hoon', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'TTSH', '[{"id": 306, "name": "Bee hoon"}]'::jsonb, false, ''),
  ('Kway teow', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'TTSH', '[{"id": 344, "name": "Kway teow"}]'::jsonb, false, ''),
  ('Mee sua', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'TTSH', '[{"id": 350, "name": "Mee sua"}]'::jsonb, false, ''),
  ('White bread', ARRAY['breakfast']::dish_meal_type[], 'TTSH', '[{"id": 378, "name": "White bread"}]'::jsonb, false, ''),
  ('Plain crackers', ARRAY['breakfast', 'snack']::dish_meal_type[], 'TTSH', '[{"id": null, "name": "Plain crackers"}]'::jsonb, false, ''),
  ('Plain biscuits', ARRAY['breakfast', 'snack']::dish_meal_type[], 'TTSH', '[{"id": null, "name": "Plain biscuits"}]'::jsonb, false, ''),
  ('Rice cereal', ARRAY['breakfast', 'snack']::dish_meal_type[], 'TTSH', '[{"id": null, "name": "Rice cereal"}]'::jsonb, false, ''),
  ('Yellow noodles', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'TTSH', '[{"id": 165, "name": "Yellow noodles"}]'::jsonb, false, ''),
  ('Mee pok', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'TTSH', '[{"id": 86, "name": "Mee pok"}]'::jsonb, false, ''),
  ('Mee kia', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'TTSH', '[{"id": 85, "name": "Mee kia"}]'::jsonb, false, ''),
  ('Pasta', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'TTSH', '[{"id": 101, "name": "Pasta"}]'::jsonb, false, ''),
  ('Brown rice', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'TTSH', '[{"id": 312, "name": "Brown rice"}]'::jsonb, false, ''),
  ('Brown rice porridge', ARRAY['breakfast']::dish_meal_type[], 'TTSH', '[{"id": 313, "name": "Brown rice porridge"}]'::jsonb, false, ''),
  ('Wholemeal bread', ARRAY['breakfast']::dish_meal_type[], 'TTSH', '[{"id": 382, "name": "Wholemeal bread"}]'::jsonb, false, ''),
  ('Wholegrain bread', ARRAY['breakfast']::dish_meal_type[], 'TTSH', '[{"id": 381, "name": "Wholegrain bread"}]'::jsonb, false, ''),
  ('Chapati', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'TTSH', '[{"id": 317, "name": "Chapati"}]'::jsonb, true, 'Cooked in oil or ghee on the griddle — too rich for prep even when plain.'),
  ('Oats', ARRAY['breakfast', 'snack']::dish_meal_type[], 'TTSH', '[{"id": 353, "name": "Oats"}]'::jsonb, false, ''),
  ('Barley', ARRAY['breakfast', 'snack']::dish_meal_type[], 'TTSH', '[{"id": 303, "name": "Barley"}]'::jsonb, false, ''),
  ('Muesli', ARRAY['breakfast', 'snack']::dish_meal_type[], 'TTSH', '[{"id": 351, "name": "Muesli"}]'::jsonb, false, ''),
  ('Popcorn', ARRAY['breakfast', 'snack']::dish_meal_type[], 'TTSH', '[{"id": 361, "name": "Popcorn"}]'::jsonb, false, ''),
  ('Bran cereal', ARRAY['breakfast', 'snack']::dish_meal_type[], 'TTSH', '[{"id": 310, "name": "Bran cereal"}]'::jsonb, false, ''),
  ('Plain prata', ARRAY['breakfast']::dish_meal_type[], 'TTSH', '[{"id": null, "name": "Plain prata"}]'::jsonb, true, 'Cooked in oil or ghee on the griddle — too rich for prep even when plain.'),
  ('Plain naan', ARRAY['breakfast']::dish_meal_type[], 'TTSH', '[{"id": null, "name": "Plain naan"}]'::jsonb, true, 'Cooked in oil or ghee on the griddle — too rich for prep even when plain.'),
  ('Plain pancake', ARRAY['breakfast']::dish_meal_type[], 'TTSH', '[{"id": null, "name": "Plain pancake"}]'::jsonb, true, 'Cooked in oil or ghee on the griddle — too rich for prep even when plain.'),
  ('Plain waffle', ARRAY['breakfast']::dish_meal_type[], 'TTSH', '[{"id": null, "name": "Plain waffle"}]'::jsonb, true, 'Cooked in oil or ghee on the griddle — too rich for prep even when plain.'),
  ('Chicken', ARRAY['lunch', 'dinner']::dish_meal_type[], 'TTSH', '[{"id": 318, "name": "Chicken"}]'::jsonb, false, ''),
  ('Fish', ARRAY['lunch', 'dinner']::dish_meal_type[], 'TTSH', '[{"id": 331, "name": "Fish"}]'::jsonb, false, ''),
  ('Prawns', ARRAY['lunch', 'dinner']::dish_meal_type[], 'TTSH', '[{"id": 110, "name": "Prawns"}]'::jsonb, false, ''),
  ('Squid', ARRAY['lunch', 'dinner']::dish_meal_type[], 'TTSH', '[{"id": 136, "name": "Squid"}]'::jsonb, false, ''),
  ('Egg', ARRAY['lunch', 'dinner']::dish_meal_type[], 'TTSH', '[{"id": 329, "name": "Egg"}]'::jsonb, false, ''),
  ('Shellfish', ARRAY['lunch', 'dinner']::dish_meal_type[], 'TTSH', '[{"id": 124, "name": "Shellfish"}]'::jsonb, false, ''),
  ('Cooking oil', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'TTSH', '[{"id": null, "name": "Cooking oil"}]'::jsonb, false, ''),
  ('Butter', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'TTSH', '[{"id": null, "name": "Butter"}]'::jsonb, false, ''),
  ('Mayonnaise', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'TTSH', '[{"id": 84, "name": "Mayonnaise"}]'::jsonb, false, ''),
  ('Coconut milk', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'TTSH', '[{"id": 33, "name": "Coconut milk"}]'::jsonb, false, ''),
  ('Coconut flesh', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'TTSH', '[{"id": null, "name": "Coconut flesh"}]'::jsonb, false, ''),
  ('Kaya', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'TTSH', '[{"id": 72, "name": "Kaya"}]'::jsonb, false, ''),
  ('Fresh milk', ARRAY['breakfast', 'drink']::dish_meal_type[], 'TTSH', '[{"id": 52, "name": "Fresh milk"}]'::jsonb, false, ''),
  ('Yoghurt', ARRAY['breakfast', 'drink']::dish_meal_type[], 'TTSH', '[{"id": 166, "name": "Yoghurt"}]'::jsonb, false, ''),
  ('Cheese', ARRAY['breakfast', 'drink']::dish_meal_type[], 'TTSH', '[{"id": 22, "name": "Cheese"}]'::jsonb, false, ''),
  ('Condensed milk', ARRAY['breakfast', 'drink']::dish_meal_type[], 'TTSH', '[{"id": 35, "name": "Condensed milk"}]'::jsonb, false, ''),
  ('Evaporated milk', ARRAY['breakfast', 'drink']::dish_meal_type[], 'TTSH', '[{"id": 46, "name": "Evaporated milk"}]'::jsonb, false, ''),
  ('Cream', ARRAY['breakfast', 'drink']::dish_meal_type[], 'TTSH', '[{"id": 38, "name": "Cream"}]'::jsonb, false, ''),
  ('Soy milk', ARRAY['drink']::dish_meal_type[], 'TTSH', '[{"id": 131, "name": "Soy milk"}]'::jsonb, false, ''),
  ('Kopi-O', ARRAY['drink']::dish_meal_type[], 'TTSH', '[{"id": 343, "name": "Kopi-O"}]'::jsonb, false, ''),
  ('Teh-O', ARRAY['drink']::dish_meal_type[], 'TTSH', '[{"id": 375, "name": "Teh-O"}]'::jsonb, false, ''),
  ('Black coffee', ARRAY['drink']::dish_meal_type[], 'TTSH', '[{"id": 309, "name": "Black coffee"}]'::jsonb, false, ''),
  ('Plain tea', ARRAY['drink']::dish_meal_type[], 'TTSH', '[{"id": 360, "name": "Plain tea"}]'::jsonb, false, ''),
  ('Kopi', ARRAY['drink']::dish_meal_type[], 'TTSH', '[{"id": 341, "name": "Kopi"}]'::jsonb, false, ''),
  ('Teh', ARRAY['drink']::dish_meal_type[], 'TTSH', '[{"id": 372, "name": "Teh"}]'::jsonb, false, ''),
  ('Kopi-C', ARRAY['drink']::dish_meal_type[], 'TTSH', '[{"id": 342, "name": "Kopi-C"}]'::jsonb, false, ''),
  ('Teh-C', ARRAY['drink']::dish_meal_type[], 'TTSH', '[{"id": 374, "name": "Teh-C"}]'::jsonb, false, ''),
  ('Teh tarik', ARRAY['drink']::dish_meal_type[], 'TTSH', '[{"id": 373, "name": "Teh tarik"}]'::jsonb, false, ''),
  ('Barley water', ARRAY['drink']::dish_meal_type[], 'TTSH', '[{"id": 304, "name": "Barley water"}]'::jsonb, false, ''),
  ('Bandung', ARRAY['drink']::dish_meal_type[], 'TTSH', '[{"id": null, "name": "Bandung"}]'::jsonb, false, ''),
  ('Soy bean drink', ARRAY['drink']::dish_meal_type[], 'TTSH', '[{"id": 130, "name": "Soy bean drink"}]'::jsonb, false, ''),

    -- --- SKH tier — mirrors the TTSH dish list, scored on SKH's own ingredient rows (58 dishes) ---
  ('White rice', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'SKH', '[{"id": 291, "name": "White rice"}]'::jsonb, false, ''),
  ('White porridge', ARRAY['breakfast']::dish_meal_type[], 'SKH', '[{"id": 290, "name": "White porridge"}]'::jsonb, false, ''),
  ('Bee hoon', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'SKH', '[{"id": 172, "name": "Bee hoon"}]'::jsonb, false, ''),
  ('Kway teow', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'SKH', '[{"id": 224, "name": "Kway teow"}]'::jsonb, false, ''),
  ('Mee sua', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'SKH', '[{"id": 233, "name": "Mee sua"}]'::jsonb, false, ''),
  ('White bread', ARRAY['breakfast']::dish_meal_type[], 'SKH', '[{"id": 289, "name": "White bread"}]'::jsonb, false, ''),
  ('Plain crackers', ARRAY['breakfast', 'snack']::dish_meal_type[], 'SKH', '[{"id": null, "name": "Plain crackers"}]'::jsonb, false, ''),
  ('Plain biscuits', ARRAY['breakfast', 'snack']::dish_meal_type[], 'SKH', '[{"id": 250, "name": "Plain biscuits"}]'::jsonb, false, ''),
  ('Rice cereal', ARRAY['breakfast', 'snack']::dish_meal_type[], 'SKH', '[{"id": 262, "name": "Rice cereal"}]'::jsonb, false, ''),
  ('Yellow noodles', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'SKH', '[{"id": 298, "name": "Yellow noodles"}]'::jsonb, false, ''),
  ('Mee pok', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'SKH', '[{"id": 232, "name": "Mee pok"}]'::jsonb, false, ''),
  ('Mee kia', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'SKH', '[{"id": 231, "name": "Mee kia"}]'::jsonb, false, ''),
  ('Pasta', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'SKH', '[{"id": 244, "name": "Pasta"}]'::jsonb, false, ''),
  ('Brown rice', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'SKH', '[{"id": 178, "name": "Brown rice"}]'::jsonb, false, ''),
  ('Brown rice porridge', ARRAY['breakfast']::dish_meal_type[], 'SKH', '[{"id": 179, "name": "Brown rice porridge"}]'::jsonb, false, ''),
  ('Wholemeal bread', ARRAY['breakfast']::dish_meal_type[], 'SKH', '[{"id": 296, "name": "Wholemeal bread"}]'::jsonb, false, ''),
  ('Wholegrain bread', ARRAY['breakfast']::dish_meal_type[], 'SKH', '[{"id": 293, "name": "Wholegrain bread"}]'::jsonb, false, ''),
  ('Chapati', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'SKH', '[{"id": 183, "name": "Chapati"}]'::jsonb, true, 'Cooked in oil or ghee on the griddle — too rich for prep even when plain.'),
  ('Oats', ARRAY['breakfast', 'snack']::dish_meal_type[], 'SKH', '[{"id": 239, "name": "Oats"}]'::jsonb, false, ''),
  ('Barley', ARRAY['breakfast', 'snack']::dish_meal_type[], 'SKH', '[{"id": 5, "name": "Barley"}]'::jsonb, false, ''),
  ('Muesli', ARRAY['breakfast', 'snack']::dish_meal_type[], 'SKH', '[{"id": 90, "name": "Muesli"}]'::jsonb, false, ''),
  ('Popcorn', ARRAY['breakfast', 'snack']::dish_meal_type[], 'SKH', '[{"id": 108, "name": "Popcorn"}]'::jsonb, false, ''),
  ('Bran cereal', ARRAY['breakfast', 'snack']::dish_meal_type[], 'SKH', '[{"id": 13, "name": "Bran cereal"}]'::jsonb, false, ''),
  ('Plain prata', ARRAY['breakfast']::dish_meal_type[], 'SKH', '[{"id": null, "name": "Plain prata"}]'::jsonb, true, 'Cooked in oil or ghee on the griddle — too rich for prep even when plain.'),
  ('Plain naan', ARRAY['breakfast']::dish_meal_type[], 'SKH', '[{"id": null, "name": "Plain naan"}]'::jsonb, true, 'Cooked in oil or ghee on the griddle — too rich for prep even when plain.'),
  ('Plain pancake', ARRAY['breakfast']::dish_meal_type[], 'SKH', '[{"id": null, "name": "Plain pancake"}]'::jsonb, true, 'Cooked in oil or ghee on the griddle — too rich for prep even when plain.'),
  ('Plain waffle', ARRAY['breakfast']::dish_meal_type[], 'SKH', '[{"id": null, "name": "Plain waffle"}]'::jsonb, true, 'Cooked in oil or ghee on the griddle — too rich for prep even when plain.'),
  ('Chicken', ARRAY['lunch', 'dinner']::dish_meal_type[], 'SKH', '[{"id": 186, "name": "Chicken"}]'::jsonb, false, ''),
  ('Fish', ARRAY['lunch', 'dinner']::dish_meal_type[], 'SKH', '[{"id": 203, "name": "Fish"}]'::jsonb, false, ''),
  ('Prawns', ARRAY['lunch', 'dinner']::dish_meal_type[], 'SKH', '[{"id": 254, "name": "Prawns"}]'::jsonb, false, ''),
  ('Squid', ARRAY['lunch', 'dinner']::dish_meal_type[], 'SKH', '[{"id": 273, "name": "Squid"}]'::jsonb, false, ''),
  ('Egg', ARRAY['lunch', 'dinner']::dish_meal_type[], 'SKH', '[{"id": 201, "name": "Egg"}]'::jsonb, false, ''),
  ('Shellfish', ARRAY['lunch', 'dinner']::dish_meal_type[], 'SKH', '[{"id": 266, "name": "Shellfish"}]'::jsonb, false, ''),
  ('Cooking oil', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'SKH', '[{"id": null, "name": "Cooking oil"}]'::jsonb, false, ''),
  ('Butter', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'SKH', '[{"id": null, "name": "Butter"}]'::jsonb, false, ''),
  ('Mayonnaise', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'SKH', '[{"id": 84, "name": "Mayonnaise"}]'::jsonb, false, ''),
  ('Coconut milk', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'SKH', '[{"id": 33, "name": "Coconut milk"}]'::jsonb, false, ''),
  ('Coconut flesh', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'SKH', '[{"id": null, "name": "Coconut flesh"}]'::jsonb, false, ''),
  ('Kaya', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'SKH', '[{"id": 72, "name": "Kaya"}]'::jsonb, false, ''),
  ('Fresh milk', ARRAY['breakfast', 'drink']::dish_meal_type[], 'SKH', '[{"id": 206, "name": "Fresh milk"}]'::jsonb, false, ''),
  ('Yoghurt', ARRAY['breakfast', 'drink']::dish_meal_type[], 'SKH', '[{"id": 299, "name": "Yoghurt"}]'::jsonb, false, ''),
  ('Cheese', ARRAY['breakfast', 'drink']::dish_meal_type[], 'SKH', '[{"id": 184, "name": "Cheese"}]'::jsonb, false, ''),
  ('Condensed milk', ARRAY['breakfast', 'drink']::dish_meal_type[], 'SKH', '[{"id": 35, "name": "Condensed milk"}]'::jsonb, false, ''),
  ('Evaporated milk', ARRAY['breakfast', 'drink']::dish_meal_type[], 'SKH', '[{"id": 46, "name": "Evaporated milk"}]'::jsonb, false, ''),
  ('Cream', ARRAY['breakfast', 'drink']::dish_meal_type[], 'SKH', '[{"id": 38, "name": "Cream"}]'::jsonb, false, ''),
  ('Soy milk', ARRAY['drink']::dish_meal_type[], 'SKH', '[{"id": 269, "name": "Soy milk"}]'::jsonb, false, ''),
  ('Kopi-O', ARRAY['drink']::dish_meal_type[], 'SKH', '[{"id": 223, "name": "Kopi-O"}]'::jsonb, false, ''),
  ('Teh-O', ARRAY['drink']::dish_meal_type[], 'SKH', '[{"id": 281, "name": "Teh-O"}]'::jsonb, false, ''),
  ('Black coffee', ARRAY['drink']::dish_meal_type[], 'SKH', '[{"id": 176, "name": "Black coffee"}]'::jsonb, false, ''),
  ('Plain tea', ARRAY['drink']::dish_meal_type[], 'SKH', '[{"id": 251, "name": "Plain tea"}]'::jsonb, false, ''),
  ('Kopi', ARRAY['drink']::dish_meal_type[], 'SKH', '[{"id": 221, "name": "Kopi"}]'::jsonb, false, ''),
  ('Teh', ARRAY['drink']::dish_meal_type[], 'SKH', '[{"id": 278, "name": "Teh"}]'::jsonb, false, ''),
  ('Kopi-C', ARRAY['drink']::dish_meal_type[], 'SKH', '[{"id": 222, "name": "Kopi-C"}]'::jsonb, false, ''),
  ('Teh-C', ARRAY['drink']::dish_meal_type[], 'SKH', '[{"id": 280, "name": "Teh-C"}]'::jsonb, false, ''),
  ('Teh tarik', ARRAY['drink']::dish_meal_type[], 'SKH', '[{"id": 279, "name": "Teh tarik"}]'::jsonb, false, ''),
  ('Barley water', ARRAY['drink']::dish_meal_type[], 'SKH', '[{"id": 6, "name": "Barley water"}]'::jsonb, false, ''),
  ('Bandung', ARRAY['drink']::dish_meal_type[], 'SKH', '[{"id": null, "name": "Bandung"}]'::jsonb, false, ''),
  ('Soy bean drink', ARRAY['drink']::dish_meal_type[], 'SKH', '[{"id": 268, "name": "Soy bean drink"}]'::jsonb, false, '');

-- Verification — run after the INSERT.
--
-- Row counts per tier (expect DIETICIAN 225, TTSH 58, SKH 58):
--   SELECT source_hospital, count(*) FROM dishes_tab GROUP BY 1 ORDER BY 1;
--
-- Every non-null ingredient id must exist, and must sit on the dish's own tier
-- or on DIETICIAN. Expect zero rows:
--   SELECT d.id, d.name, d.source_hospital, e->>'name' AS ingredient
--   FROM dishes_tab d
--   CROSS JOIN LATERAL jsonb_array_elements(d.ingredient_list) e
--   LEFT JOIN ingredient_tab i ON i.id = (e->>'id')::bigint
--   WHERE e->>'id' IS NOT NULL
--     AND (i.id IS NULL
--          OR i.source_hospital NOT IN (d.source_hospital, 'DIETICIAN'::food_source));
--
-- hard_no rows (expect 34, none with an empty reason):
--   SELECT count(*) FILTER (WHERE hard_no),
--          count(*) FILTER (WHERE hard_no AND hard_no_reason = '')
--   FROM dishes_tab;
--
-- Ingredient names that did not resolve
-- (expect 14 DIETICIAN / 11 TTSH / 9 SKH distinct names, one dish each):
--   SELECT d.source_hospital, e->>'name' AS unresolved, count(*) AS dishes
--   FROM dishes_tab d
--   CROSS JOIN LATERAL jsonb_array_elements(d.ingredient_list) e
--   WHERE e->>'id' IS NULL
--   GROUP BY 1, 2
--   ORDER BY 1, 2;
