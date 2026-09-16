-- Seed for ingredient_tab / dishes_tab.
-- Converted from the sourced ruleset in frontend/src/data/foods.ts (SGH/NCCS
-- yellow form, TTSH brochure, CGH instruction audit). Rows are only added
-- per hospital when that hospital's sheet actually differs from the general
-- low-residue baseline — everything else lives on the DIETICIAN tier, which
-- the app falls back to when a hospital-specific row is missing.

-- === Ingredients: universal (DIETICIAN baseline only) ===============

INSERT INTO ingredient_tab (name, classification, classification_reason, source_hospital, source_document) VALUES
('White rice', 'can', 'Refined starch (R1). Brown rice is not allowed.', 'DIETICIAN', 'Doc 03 low-residue ruleset — SGH/NCCS yellow form: Can eat white rice'),
('Plain noodles (bee hoon / kway teow / mee sua, not fried)', 'can', 'Refined noodles, not fried, no vegetables (R1).', 'DIETICIAN', 'Doc 03 low-residue ruleset — SGH/NCCS yellow form: plain noodle soup allowed'),
('Plain white bread', 'can', 'Refined starch (R1).', 'DIETICIAN', 'Doc 03 low-residue ruleset — SGH/NCCS yellow form: Can eat plain white bread'),
('Kaya / butter / jam spread', 'review', 'Allowed during the 3-day low-residue window, but not on the morning of the scope. Which day are you asking about?', 'DIETICIAN', 'Doc 03 low-residue ruleset — SGH/NCCS yellow form'),
('Plain thosai', 'can', 'Named refined starch, white sugar only.', 'DIETICIAN', 'Doc 03 low-residue ruleset — SGH/NCCS yellow form: Can eat plain thosai'),
('Idli', 'can', 'Refined steamed starch (R1).', 'DIETICIAN', 'Doc 03 low-residue ruleset — SGH form (idiyappam/thosai family)'),
('Idiyappam / putu mayam', 'can', 'Named refined starch, white sugar only.', 'DIETICIAN', 'Doc 03 low-residue ruleset — SGH/NCCS yellow form'),
('Plain roti prata', 'review', 'Prata is cooked in oil — the SGH form lists it as allowed and separately forbids fried food. Internal contradiction, not something to guess.', 'DIETICIAN', 'Doc 03 low-residue ruleset — SGH/NCCS yellow form (Q3/F7)'),
('Lean protein (fish / chicken / pork / seafood)', 'can', 'Lean protein, not fried, no skin-on fatty cuts (R2).', 'DIETICIAN', 'Doc 03 low-residue ruleset — SGH/NCCS yellow form: fish / chicken / pork / seafood'),
('Steamed / boiled egg', 'can', 'Lean protein (R2). Fried eggs are a different question.', 'DIETICIAN', 'Doc 03 low-residue ruleset — SGH/NCCS yellow form: eggs (boiled, poached)'),
('Plain tofu / taukwa', 'can', 'Named lean protein, not fried (R2).', 'DIETICIAN', 'Doc 03 low-residue ruleset — SGH/NCCS yellow form: plain tofu'),
('Fishcake', 'can', 'Lean protein (R2).', 'DIETICIAN', 'Doc 03 low-residue ruleset — sample dish list'),
('Vegetables (incl. garnishes such as cucumber)', 'cannot', 'No plant fibre (R3), including garnishes.', 'DIETICIAN', 'Doc 03 low-residue ruleset — SGH/NCCS yellow form: Cannot eat vegetables'),
('Fruit', 'cannot', 'No plant fibre (R3).', 'DIETICIAN', 'Doc 03 low-residue ruleset — SGH/NCCS yellow form: Cannot eat fruits'),
('Nuts, seeds, beans, lentils', 'cannot', 'Plant fibre / pulses (R3).', 'DIETICIAN', 'Doc 03 low-residue ruleset — R3'),
('Red meat (beef / mutton / duck)', 'cannot', 'Excluded even though chicken and pork are allowed.', 'DIETICIAN', 'Doc 03 low-residue ruleset — SGH/NCCS yellow form: Cannot eat red meat'),
('Fried food / deep-fried batter or oil', 'cannot', 'Nothing fried (R5).', 'DIETICIAN', 'Doc 03 low-residue ruleset — SGH/NCCS yellow form: Cannot eat fried food'),
('Coconut milk / dairy / cheese / yoghurt', 'cannot', 'No dairy, no coconut milk (R4).', 'DIETICIAN', 'Doc 03 low-residue ruleset — SGH/NCCS yellow form: milk products excluded'),
('100Plus / colourless isotonic or soft drinks', 'can', 'Named clear fluid. Avoid red or dark-coloured drinks.', 'DIETICIAN', 'Doc 03 low-residue ruleset — SGH/NCCS yellow form: colourless soft drinks'),
('Barley water (no pearls)', 'can', 'Named clear fluid. No pearls, no grass jelly.', 'DIETICIAN', 'Doc 03 low-residue ruleset — SGH/NCCS yellow form: barley water (no pearls)'),
('Plain water', 'can', 'Always the default clear fluid, until your fasting cutoff.', 'DIETICIAN', 'Doc 03 low-residue ruleset — SGH/NCCS yellow form: plain water'),
('Peeled potato / yam', 'can', 'Allowed only peeled (R6). Fries are fried (R5) and are cannot.', 'DIETICIAN', 'Doc 03 low-residue ruleset — SGH/NCCS yellow form: potato / yam (no skin)');

-- === Ingredients: hospital-specific (real conflicts across sheets) ===

-- Kopi-O / Teh-O (no milk, with sugar)
INSERT INTO ingredient_tab (name, classification, classification_reason, source_hospital, source_document) VALUES
('Kopi-O / Teh-O (no milk)', 'can', 'SGH allows coffee/tea with no milk, and tea-O with sugar on the morning of scope.', 'SGH', 'SGH/NCCS yellow form — Can drink: coffee/tea (no milk)'),
('Kopi-O / Teh-O (no milk)', 'can', 'TTSH permits coffee or tea with or without milk during the three-day period.', 'TTSH', 'TTSH brochure March 2026'),
('Kopi-O / Teh-O (no milk)', 'can', 'CGH specifies drinks without milk. Kopi-O is the no-milk version.', 'CGH', 'Hospital instruction audit v2 — CGH: no milk'),
('Kopi-O / Teh-O (no milk)', 'review', 'Coffee/tea rules differ across hospital sheets. Follow your own hospital''s form.', 'DIETICIAN', 'Doc 03 low-residue ruleset — hospital instruction audit');

-- Kopi / Teh with milk
INSERT INTO ingredient_tab (name, classification, classification_reason, source_hospital, source_document) VALUES
('Kopi / Teh with milk', 'cannot', 'SGH specifies coffee and tea with no milk.', 'SGH', 'SGH/NCCS yellow form — Can drink: coffee/tea (no milk)'),
('Kopi / Teh with milk', 'can', 'TTSH explicitly permits coffee and tea with or without milk.', 'TTSH', 'TTSH brochure March 2026'),
('Kopi / Teh with milk', 'cannot', 'CGH specifies no milk (e.g. Milo without milk).', 'CGH', 'Hospital instruction audit v2'),
('Kopi / Teh with milk', 'review', 'Hospitals disagree on milk in coffee/tea (F5) — this tool never averages. Follow your own hospital''s form.', 'DIETICIAN', 'Doc 03 low-residue ruleset — F5');

-- Apple / fruit juice
INSERT INTO ingredient_tab (name, classification, classification_reason, source_hospital, source_document) VALUES
('Apple juice / fruit juice', 'cannot', 'SGH explicitly forbids all fruit juices.', 'SGH', 'SGH/NCCS yellow form — Cannot drink: fruit juices'),
('Apple juice / fruit juice', 'review', 'TTSH sheet is silent on fruit juice. Silent does not mean permitted.', 'TTSH', 'Hospital instruction audit v2 — TTSH: silent'),
('Apple juice / fruit juice', 'review', 'CGH sheet is silent on fruit juice. Silent does not mean permitted.', 'CGH', 'Hospital instruction audit v2 — CGH: silent'),
('Apple juice / fruit juice', 'review', 'Hospital conflict / gap (Q1/F6) — this tool never averages. Follow your own hospital''s form.', 'DIETICIAN', 'Doc 03 low-residue ruleset — Q1/F6');

-- Milo / Horlicks / Ovaltine
INSERT INTO ingredient_tab (name, classification, classification_reason, source_hospital, source_document) VALUES
('Milo / Horlicks / Ovaltine', 'cannot', 'Malted milk drinks are excluded on the SGH sheet.', 'SGH', 'SGH/NCCS yellow form — Cannot drink: Milo, Ovaltine'),
('Milo / Horlicks / Ovaltine', 'cannot', 'TTSH sheet excludes malted milk drinks alongside dairy.', 'TTSH', 'Hospital instruction audit v2'),
('Milo / Horlicks / Ovaltine', 'review', 'CGH specifies Milo without milk — a different instruction from SGH''s outright ban. Ask your CGH care team which they mean.', 'CGH', 'Hospital instruction audit v2 — CGH: Milo without milk'),
('Milo / Horlicks / Ovaltine', 'cannot', 'Malted milk drinks are excluded on every sheet we have as a baseline.', 'DIETICIAN', 'Doc 03 low-residue ruleset — R4');

-- === Dishes: universal (DIETICIAN baseline only) =====================

INSERT INTO dishes_tab (name, meal_type, source_hospital, ingredient_list) VALUES
('Plain white bread', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain white bread' AND source_hospital = 'DIETICIAN'), 'name', 'Plain white bread'))),
('Kaya toast', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain white bread' AND source_hospital = 'DIETICIAN'), 'name', 'Plain white bread'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Kaya / butter / jam spread' AND source_hospital = 'DIETICIAN'), 'name', 'Kaya / butter / jam spread')
  )),
('Plain porridge (fish or chicken)', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lean protein (fish / chicken / pork / seafood)' AND source_hospital = 'DIETICIAN'), 'name', 'Lean protein (fish / chicken / pork / seafood)')
  )),
('Plain thosai', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain thosai' AND source_hospital = 'DIETICIAN'), 'name', 'Plain thosai'))),
('Idli', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Idli' AND source_hospital = 'DIETICIAN'), 'name', 'Idli'))),
('Idiyappam / putu mayam', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Idiyappam / putu mayam' AND source_hospital = 'DIETICIAN'), 'name', 'Idiyappam / putu mayam'))),
('Plain roti prata', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain roti prata' AND source_hospital = 'DIETICIAN'), 'name', 'Plain roti prata'))),
('Steamed egg with rice', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Steamed / boiled egg' AND source_hospital = 'DIETICIAN'), 'name', 'Steamed / boiled egg')
  )),

('Chicken rice (with cucumber garnish)', ARRAY['lunch']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lean protein (fish / chicken / pork / seafood)' AND source_hospital = 'DIETICIAN'), 'name', 'Lean protein (fish / chicken / pork / seafood)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),
('Steamed fish with rice', ARRAY['lunch']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lean protein (fish / chicken / pork / seafood)' AND source_hospital = 'DIETICIAN'), 'name', 'Lean protein (fish / chicken / pork / seafood)')
  )),
('Yong tau foo (with vegetables)', ARRAY['lunch']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain tofu / taukwa' AND source_hospital = 'DIETICIAN'), 'name', 'Plain tofu / taukwa'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fishcake' AND source_hospital = 'DIETICIAN'), 'name', 'Fishcake'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),
('Yong tau foo (fishcake and tofu only)', ARRAY['lunch']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain tofu / taukwa' AND source_hospital = 'DIETICIAN'), 'name', 'Plain tofu / taukwa'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fishcake' AND source_hospital = 'DIETICIAN'), 'name', 'Fishcake')
  )),
('Plain noodle soup', ARRAY['lunch']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain noodles (bee hoon / kway teow / mee sua, not fried)' AND source_hospital = 'DIETICIAN'), 'name', 'Plain noodles (bee hoon / kway teow / mee sua, not fried)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lean protein (fish / chicken / pork / seafood)' AND source_hospital = 'DIETICIAN'), 'name', 'Lean protein (fish / chicken / pork / seafood)')
  )),
('Char kway teow', ARRAY['lunch']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain noodles (bee hoon / kway teow / mee sua, not fried)' AND source_hospital = 'DIETICIAN'), 'name', 'Plain noodles (bee hoon / kway teow / mee sua, not fried)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fried food / deep-fried batter or oil' AND source_hospital = 'DIETICIAN'), 'name', 'Fried food / deep-fried batter or oil')
  )),
('Mee goreng', ARRAY['lunch']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain noodles (bee hoon / kway teow / mee sua, not fried)' AND source_hospital = 'DIETICIAN'), 'name', 'Plain noodles (bee hoon / kway teow / mee sua, not fried)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fried food / deep-fried batter or oil' AND source_hospital = 'DIETICIAN'), 'name', 'Fried food / deep-fried batter or oil'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),

('Tofu with rice', ARRAY['dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain tofu / taukwa' AND source_hospital = 'DIETICIAN'), 'name', 'Plain tofu / taukwa')
  )),
('Nasi lemak', ARRAY['dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fried food / deep-fried batter or oil' AND source_hospital = 'DIETICIAN'), 'name', 'Fried food / deep-fried batter or oil'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Coconut milk / dairy / cheese / yoghurt' AND source_hospital = 'DIETICIAN'), 'name', 'Coconut milk / dairy / cheese / yoghurt')
  )),
('Beef noodles', ARRAY['dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain noodles (bee hoon / kway teow / mee sua, not fried)' AND source_hospital = 'DIETICIAN'), 'name', 'Plain noodles (bee hoon / kway teow / mee sua, not fried)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Red meat (beef / mutton / duck)' AND source_hospital = 'DIETICIAN'), 'name', 'Red meat (beef / mutton / duck)')
  )),
('Fried egg with rice', ARRAY['dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fried food / deep-fried batter or oil' AND source_hospital = 'DIETICIAN'), 'name', 'Fried food / deep-fried batter or oil')
  )),

('100Plus / colourless isotonic or soft drinks', ARRAY['drink']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = '100Plus / colourless isotonic or soft drinks' AND source_hospital = 'DIETICIAN'), 'name', '100Plus / colourless isotonic or soft drinks'))),
('Barley water', ARRAY['drink']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Barley water (no pearls)' AND source_hospital = 'DIETICIAN'), 'name', 'Barley water (no pearls)'))),
('Plain water', ARRAY['drink']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain water' AND source_hospital = 'DIETICIAN'), 'name', 'Plain water'))),
('Peeled potato / yam', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Peeled potato / yam' AND source_hospital = 'DIETICIAN'), 'name', 'Peeled potato / yam')));

-- === Dishes: hospital-specific (mirrors the ingredient conflicts above) ==

INSERT INTO dishes_tab (name, meal_type, source_hospital, ingredient_list) VALUES
('Kopi-O / Teh-O', ARRAY['drink']::dish_meal_type[], 'SGH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Kopi-O / Teh-O (no milk)' AND source_hospital = 'SGH'), 'name', 'Kopi-O / Teh-O (no milk)'))),
('Kopi-O / Teh-O', ARRAY['drink']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Kopi-O / Teh-O (no milk)' AND source_hospital = 'TTSH'), 'name', 'Kopi-O / Teh-O (no milk)'))),
('Kopi-O / Teh-O', ARRAY['drink']::dish_meal_type[], 'CGH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Kopi-O / Teh-O (no milk)' AND source_hospital = 'CGH'), 'name', 'Kopi-O / Teh-O (no milk)'))),
('Kopi-O / Teh-O', ARRAY['drink']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Kopi-O / Teh-O (no milk)' AND source_hospital = 'DIETICIAN'), 'name', 'Kopi-O / Teh-O (no milk)'))),

('Kopi / Teh with milk', ARRAY['drink']::dish_meal_type[], 'SGH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Kopi / Teh with milk' AND source_hospital = 'SGH'), 'name', 'Kopi / Teh with milk'))),
('Kopi / Teh with milk', ARRAY['drink']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Kopi / Teh with milk' AND source_hospital = 'TTSH'), 'name', 'Kopi / Teh with milk'))),
('Kopi / Teh with milk', ARRAY['drink']::dish_meal_type[], 'CGH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Kopi / Teh with milk' AND source_hospital = 'CGH'), 'name', 'Kopi / Teh with milk'))),
('Kopi / Teh with milk', ARRAY['drink']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Kopi / Teh with milk' AND source_hospital = 'DIETICIAN'), 'name', 'Kopi / Teh with milk'))),

('Apple juice', ARRAY['drink']::dish_meal_type[], 'SGH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Apple juice / fruit juice' AND source_hospital = 'SGH'), 'name', 'Apple juice / fruit juice'))),
('Apple juice', ARRAY['drink']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Apple juice / fruit juice' AND source_hospital = 'TTSH'), 'name', 'Apple juice / fruit juice'))),
('Apple juice', ARRAY['drink']::dish_meal_type[], 'CGH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Apple juice / fruit juice' AND source_hospital = 'CGH'), 'name', 'Apple juice / fruit juice'))),
('Apple juice', ARRAY['drink']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Apple juice / fruit juice' AND source_hospital = 'DIETICIAN'), 'name', 'Apple juice / fruit juice'))),

('Milo', ARRAY['drink']::dish_meal_type[], 'SGH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Milo / Horlicks / Ovaltine' AND source_hospital = 'SGH'), 'name', 'Milo / Horlicks / Ovaltine'))),
('Milo', ARRAY['drink']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Milo / Horlicks / Ovaltine' AND source_hospital = 'TTSH'), 'name', 'Milo / Horlicks / Ovaltine'))),
('Milo', ARRAY['drink']::dish_meal_type[], 'CGH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Milo / Horlicks / Ovaltine' AND source_hospital = 'CGH'), 'name', 'Milo / Horlicks / Ovaltine'))),
('Milo', ARRAY['drink']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Milo / Horlicks / Ovaltine' AND source_hospital = 'DIETICIAN'), 'name', 'Milo / Horlicks / Ovaltine')));

-- === Ingredients: cuisine expansion (Chinese / Indian / Malay / Vegetarian) ===
-- DIETICIAN baseline only -- no hospital sheet calls these out individually,
-- so they follow the same R1-R6 rules as the rest of the baseline.

INSERT INTO ingredient_tab (name, classification, classification_reason, source_hospital, source_document) VALUES
('Char siew (lean BBQ pork, trimmed)', 'can', 'Lean roasted pork, no skin or fat retained (R2).', 'DIETICIAN', 'Cuisine expansion — inferred from R1-R6 low-residue rules (not hospital-sheet-sourced)'),
('Century egg (preserved duck egg)', 'review', 'Preserved egg with an unclear residue profile. Ask your dietician before eating it during the low-residue window.', 'DIETICIAN', 'Cuisine expansion — inferred from R1-R6 low-residue rules (not hospital-sheet-sourced)'),
('Steamed bun / bao (plain flour, not fried)', 'can', 'Refined wheat flour, steamed rather than fried (R1).', 'DIETICIAN', 'Cuisine expansion — inferred from R1-R6 low-residue rules (not hospital-sheet-sourced)'),
('Silken tofu dessert (tau huay)', 'can', 'Soft tofu in syrup — no dairy, not fried (R2).', 'DIETICIAN', 'Cuisine expansion — inferred from R1-R6 low-residue rules (not hospital-sheet-sourced)'),
('Wonton (pork & prawn dumpling, boiled)', 'can', 'Lean minced protein wrapped in refined flour, boiled not fried (R1/R2).', 'DIETICIAN', 'Cuisine expansion — inferred from R1-R6 low-residue rules (not hospital-sheet-sourced)'),
('Braised pork belly (fatty, skin-on)', 'cannot', 'Skin-on fatty cut — excluded even though lean pork is allowed (R2).', 'DIETICIAN', 'Cuisine expansion — inferred from R1-R6 low-residue rules (not hospital-sheet-sourced)'),
('Chinese preserved sausage (lap cheong)', 'cannot', 'Cured, fatty processed meat (R2 exclusion).', 'DIETICIAN', 'Cuisine expansion — inferred from R1-R6 low-residue rules (not hospital-sheet-sourced)'),
('Achar (pickled vegetables)', 'cannot', 'Vegetables, pickled or fresh (R3).', 'DIETICIAN', 'Cuisine expansion — inferred from R1-R6 low-residue rules (not hospital-sheet-sourced)'),
('You tiao (fried dough stick)', 'cannot', 'Deep-fried dough (R5).', 'DIETICIAN', 'Cuisine expansion — inferred from R1-R6 low-residue rules (not hospital-sheet-sourced)'),
('Sambar (lentil & vegetable stew)', 'cannot', 'Lentils and vegetables (R3).', 'DIETICIAN', 'Cuisine expansion — inferred from R1-R6 low-residue rules (not hospital-sheet-sourced)'),
('Coconut chutney', 'cannot', 'Coconut-based (R4).', 'DIETICIAN', 'Cuisine expansion — inferred from R1-R6 low-residue rules (not hospital-sheet-sourced)'),
('Upma (semolina porridge, plain)', 'can', 'Refined semolina, no added vegetables (R1).', 'DIETICIAN', 'Cuisine expansion — inferred from R1-R6 low-residue rules (not hospital-sheet-sourced)'),
('Poha (flattened rice, plain)', 'can', 'Refined flattened rice, plain (R1).', 'DIETICIAN', 'Cuisine expansion — inferred from R1-R6 low-residue rules (not hospital-sheet-sourced)'),
('Chapati (plain, not fried)', 'can', 'Refined wheat flatbread, griddled not fried (R1).', 'DIETICIAN', 'Cuisine expansion — inferred from R1-R6 low-residue rules (not hospital-sheet-sourced)'),
('Dhal / lentil curry', 'cannot', 'Lentils (R3).', 'DIETICIAN', 'Cuisine expansion — inferred from R1-R6 low-residue rules (not hospital-sheet-sourced)'),
('Paneer / cottage cheese', 'cannot', 'Dairy (R4).', 'DIETICIAN', 'Cuisine expansion — inferred from R1-R6 low-residue rules (not hospital-sheet-sourced)'),
('Curry gravy (spiced, no vegetables/lentils)', 'review', 'Spiced but with no named plant fibre — heavy-spice tolerance is patient-specific. Ask your dietician.', 'DIETICIAN', 'Cuisine expansion — inferred from R1-R6 low-residue rules (not hospital-sheet-sourced)'),
('Rasam (tamarind & lentil soup)', 'cannot', 'Lentils (R3).', 'DIETICIAN', 'Cuisine expansion — inferred from R1-R6 low-residue rules (not hospital-sheet-sourced)'),
('Ikan bilis (fried anchovies)', 'cannot', 'Deep-fried (R5).', 'DIETICIAN', 'Cuisine expansion — inferred from R1-R6 low-residue rules (not hospital-sheet-sourced)'),
('Rendang (coconut meat stew)', 'cannot', 'Coconut milk and slow-cooked fibrous meat (R4).', 'DIETICIAN', 'Cuisine expansion — inferred from R1-R6 low-residue rules (not hospital-sheet-sourced)'),
('Sambal / chilli paste', 'review', 'Chilli-paste tolerance is patient-specific. Ask your dietician.', 'DIETICIAN', 'Cuisine expansion — inferred from R1-R6 low-residue rules (not hospital-sheet-sourced)'),
('Satay (grilled skewered meat, no sauce)', 'can', 'Lean grilled protein, no sauce, not fried (R2).', 'DIETICIAN', 'Cuisine expansion — inferred from R1-R6 low-residue rules (not hospital-sheet-sourced)'),
('Tempeh', 'cannot', 'Fermented whole soybean — plant fibre (R3).', 'DIETICIAN', 'Cuisine expansion — inferred from R1-R6 low-residue rules (not hospital-sheet-sourced)'),
('Beancurd skin (tau kee)', 'cannot', 'Soy skin — plant fibre (R3).', 'DIETICIAN', 'Cuisine expansion — inferred from R1-R6 low-residue rules (not hospital-sheet-sourced)'),
('Mock meat (soy-based vegetarian protein)', 'review', 'Processed soy protein with unclear fibre content. Ask your dietician.', 'DIETICIAN', 'Cuisine expansion — inferred from R1-R6 low-residue rules (not hospital-sheet-sourced)'),
('Mushroom', 'cannot', 'Fungal fibre, restricted like vegetables (R3).', 'DIETICIAN', 'Cuisine expansion — inferred from R1-R6 low-residue rules (not hospital-sheet-sourced)');

-- === Dishes: cuisine expansion (Chinese / Indian / Malay / Vegetarian) ===
-- Added to both SGH and DIETICIAN tiers per product request; the underlying
-- ingredient classifications are the shared DIETICIAN baseline (no sheet-specific
-- conflict is known for these dishes today).

-- --- CHINESE ---
INSERT INTO dishes_tab (name, meal_type, source_hospital, ingredient_list) VALUES
('Century egg & lean pork congee', ARRAY['breakfast']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Char siew (lean BBQ pork, trimmed)' AND source_hospital = 'DIETICIAN'), 'name', 'Char siew (lean BBQ pork, trimmed)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Century egg (preserved duck egg)' AND source_hospital = 'DIETICIAN'), 'name', 'Century egg (preserved duck egg)')
  )),
('Century egg & lean pork congee', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Char siew (lean BBQ pork, trimmed)' AND source_hospital = 'DIETICIAN'), 'name', 'Char siew (lean BBQ pork, trimmed)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Century egg (preserved duck egg)' AND source_hospital = 'DIETICIAN'), 'name', 'Century egg (preserved duck egg)')
  )),
('You tiao with silken tofu dessert (tau huay)', ARRAY['breakfast']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'You tiao (fried dough stick)' AND source_hospital = 'DIETICIAN'), 'name', 'You tiao (fried dough stick)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Silken tofu dessert (tau huay)' AND source_hospital = 'DIETICIAN'), 'name', 'Silken tofu dessert (tau huay)')
  )),
('You tiao with silken tofu dessert (tau huay)', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'You tiao (fried dough stick)' AND source_hospital = 'DIETICIAN'), 'name', 'You tiao (fried dough stick)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Silken tofu dessert (tau huay)' AND source_hospital = 'DIETICIAN'), 'name', 'Silken tofu dessert (tau huay)')
  )),
('Steamed char siew bao', ARRAY['breakfast']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Steamed bun / bao (plain flour, not fried)' AND source_hospital = 'DIETICIAN'), 'name', 'Steamed bun / bao (plain flour, not fried)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Char siew (lean BBQ pork, trimmed)' AND source_hospital = 'DIETICIAN'), 'name', 'Char siew (lean BBQ pork, trimmed)')
  )),
('Steamed char siew bao', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Steamed bun / bao (plain flour, not fried)' AND source_hospital = 'DIETICIAN'), 'name', 'Steamed bun / bao (plain flour, not fried)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Char siew (lean BBQ pork, trimmed)' AND source_hospital = 'DIETICIAN'), 'name', 'Char siew (lean BBQ pork, trimmed)')
  )),
('Plain rice porridge with fish', ARRAY['breakfast']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lean protein (fish / chicken / pork / seafood)' AND source_hospital = 'DIETICIAN'), 'name', 'Lean protein (fish / chicken / pork / seafood)')
  )),
('Plain rice porridge with fish', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lean protein (fish / chicken / pork / seafood)' AND source_hospital = 'DIETICIAN'), 'name', 'Lean protein (fish / chicken / pork / seafood)')
  )),
('Century egg & preserved vegetable congee', ARRAY['breakfast']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Century egg (preserved duck egg)' AND source_hospital = 'DIETICIAN'), 'name', 'Century egg (preserved duck egg)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Achar (pickled vegetables)' AND source_hospital = 'DIETICIAN'), 'name', 'Achar (pickled vegetables)')
  )),
('Century egg & preserved vegetable congee', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Century egg (preserved duck egg)' AND source_hospital = 'DIETICIAN'), 'name', 'Century egg (preserved duck egg)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Achar (pickled vegetables)' AND source_hospital = 'DIETICIAN'), 'name', 'Achar (pickled vegetables)')
  )),
('Hainanese chicken rice', ARRAY['lunch']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lean protein (fish / chicken / pork / seafood)' AND source_hospital = 'DIETICIAN'), 'name', 'Lean protein (fish / chicken / pork / seafood)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),
('Hainanese chicken rice', ARRAY['lunch']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lean protein (fish / chicken / pork / seafood)' AND source_hospital = 'DIETICIAN'), 'name', 'Lean protein (fish / chicken / pork / seafood)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),
('Char siew rice', ARRAY['lunch']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Char siew (lean BBQ pork, trimmed)' AND source_hospital = 'DIETICIAN'), 'name', 'Char siew (lean BBQ pork, trimmed)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),
('Char siew rice', ARRAY['lunch']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Char siew (lean BBQ pork, trimmed)' AND source_hospital = 'DIETICIAN'), 'name', 'Char siew (lean BBQ pork, trimmed)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),
('Wonton noodle soup', ARRAY['lunch']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain noodles (bee hoon / kway teow / mee sua, not fried)' AND source_hospital = 'DIETICIAN'), 'name', 'Plain noodles (bee hoon / kway teow / mee sua, not fried)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Wonton (pork & prawn dumpling, boiled)' AND source_hospital = 'DIETICIAN'), 'name', 'Wonton (pork & prawn dumpling, boiled)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),
('Wonton noodle soup', ARRAY['lunch']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain noodles (bee hoon / kway teow / mee sua, not fried)' AND source_hospital = 'DIETICIAN'), 'name', 'Plain noodles (bee hoon / kway teow / mee sua, not fried)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Wonton (pork & prawn dumpling, boiled)' AND source_hospital = 'DIETICIAN'), 'name', 'Wonton (pork & prawn dumpling, boiled)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),
('Beef hor fun', ARRAY['lunch']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain noodles (bee hoon / kway teow / mee sua, not fried)' AND source_hospital = 'DIETICIAN'), 'name', 'Plain noodles (bee hoon / kway teow / mee sua, not fried)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Red meat (beef / mutton / duck)' AND source_hospital = 'DIETICIAN'), 'name', 'Red meat (beef / mutton / duck)')
  )),
('Beef hor fun', ARRAY['lunch']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain noodles (bee hoon / kway teow / mee sua, not fried)' AND source_hospital = 'DIETICIAN'), 'name', 'Plain noodles (bee hoon / kway teow / mee sua, not fried)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Red meat (beef / mutton / duck)' AND source_hospital = 'DIETICIAN'), 'name', 'Red meat (beef / mutton / duck)')
  )),
('Teochew yong tau foo', ARRAY['lunch']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain tofu / taukwa' AND source_hospital = 'DIETICIAN'), 'name', 'Plain tofu / taukwa'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),
('Teochew yong tau foo', ARRAY['lunch']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain tofu / taukwa' AND source_hospital = 'DIETICIAN'), 'name', 'Plain tofu / taukwa'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),
('Teochew steamed fish with rice', ARRAY['dinner']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lean protein (fish / chicken / pork / seafood)' AND source_hospital = 'DIETICIAN'), 'name', 'Lean protein (fish / chicken / pork / seafood)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Achar (pickled vegetables)' AND source_hospital = 'DIETICIAN'), 'name', 'Achar (pickled vegetables)')
  )),
('Teochew steamed fish with rice', ARRAY['dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lean protein (fish / chicken / pork / seafood)' AND source_hospital = 'DIETICIAN'), 'name', 'Lean protein (fish / chicken / pork / seafood)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Achar (pickled vegetables)' AND source_hospital = 'DIETICIAN'), 'name', 'Achar (pickled vegetables)')
  )),
('Braised pork rice (lu rou fan)', ARRAY['dinner']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Braised pork belly (fatty, skin-on)' AND source_hospital = 'DIETICIAN'), 'name', 'Braised pork belly (fatty, skin-on)')
  )),
('Braised pork rice (lu rou fan)', ARRAY['dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Braised pork belly (fatty, skin-on)' AND source_hospital = 'DIETICIAN'), 'name', 'Braised pork belly (fatty, skin-on)')
  )),
('Claypot rice with preserved sausage', ARRAY['dinner']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chinese preserved sausage (lap cheong)' AND source_hospital = 'DIETICIAN'), 'name', 'Chinese preserved sausage (lap cheong)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),
('Claypot rice with preserved sausage', ARRAY['dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chinese preserved sausage (lap cheong)' AND source_hospital = 'DIETICIAN'), 'name', 'Chinese preserved sausage (lap cheong)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),
('Beancurd skin roll with rice', ARRAY['dinner']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Beancurd skin (tau kee)' AND source_hospital = 'DIETICIAN'), 'name', 'Beancurd skin (tau kee)')
  )),
('Beancurd skin roll with rice', ARRAY['dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Beancurd skin (tau kee)' AND source_hospital = 'DIETICIAN'), 'name', 'Beancurd skin (tau kee)')
  )),
('Sweet and sour pork with rice', ARRAY['dinner']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fried food / deep-fried batter or oil' AND source_hospital = 'DIETICIAN'), 'name', 'Fried food / deep-fried batter or oil'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),
('Sweet and sour pork with rice', ARRAY['dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fried food / deep-fried batter or oil' AND source_hospital = 'DIETICIAN'), 'name', 'Fried food / deep-fried batter or oil'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  ));

-- --- INDIAN ---
INSERT INTO dishes_tab (name, meal_type, source_hospital, ingredient_list) VALUES
('Plain thosai with sambar', ARRAY['breakfast']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain thosai' AND source_hospital = 'DIETICIAN'), 'name', 'Plain thosai'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Sambar (lentil & vegetable stew)' AND source_hospital = 'DIETICIAN'), 'name', 'Sambar (lentil & vegetable stew)')
  )),
('Plain thosai with sambar', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain thosai' AND source_hospital = 'DIETICIAN'), 'name', 'Plain thosai'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Sambar (lentil & vegetable stew)' AND source_hospital = 'DIETICIAN'), 'name', 'Sambar (lentil & vegetable stew)')
  )),
('Idli with coconut chutney', ARRAY['breakfast']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Idli' AND source_hospital = 'DIETICIAN'), 'name', 'Idli'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Coconut chutney' AND source_hospital = 'DIETICIAN'), 'name', 'Coconut chutney')
  )),
('Idli with coconut chutney', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Idli' AND source_hospital = 'DIETICIAN'), 'name', 'Idli'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Coconut chutney' AND source_hospital = 'DIETICIAN'), 'name', 'Coconut chutney')
  )),
('Upma (semolina porridge)', ARRAY['breakfast']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Upma (semolina porridge, plain)' AND source_hospital = 'DIETICIAN'), 'name', 'Upma (semolina porridge, plain)')
  )),
('Upma (semolina porridge)', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Upma (semolina porridge, plain)' AND source_hospital = 'DIETICIAN'), 'name', 'Upma (semolina porridge, plain)')
  )),
('Poha (flattened rice)', ARRAY['breakfast']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Poha (flattened rice, plain)' AND source_hospital = 'DIETICIAN'), 'name', 'Poha (flattened rice, plain)')
  )),
('Poha (flattened rice)', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Poha (flattened rice, plain)' AND source_hospital = 'DIETICIAN'), 'name', 'Poha (flattened rice, plain)')
  )),
('Plain chapati with dhal curry', ARRAY['breakfast']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chapati (plain, not fried)' AND source_hospital = 'DIETICIAN'), 'name', 'Chapati (plain, not fried)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Dhal / lentil curry' AND source_hospital = 'DIETICIAN'), 'name', 'Dhal / lentil curry')
  )),
('Plain chapati with dhal curry', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chapati (plain, not fried)' AND source_hospital = 'DIETICIAN'), 'name', 'Chapati (plain, not fried)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Dhal / lentil curry' AND source_hospital = 'DIETICIAN'), 'name', 'Dhal / lentil curry')
  )),
('Vegetable biryani', ARRAY['lunch']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Nuts, seeds, beans, lentils' AND source_hospital = 'DIETICIAN'), 'name', 'Nuts, seeds, beans, lentils')
  )),
('Vegetable biryani', ARRAY['lunch']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Nuts, seeds, beans, lentils' AND source_hospital = 'DIETICIAN'), 'name', 'Nuts, seeds, beans, lentils')
  )),
('Chicken curry with rice', ARRAY['lunch']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lean protein (fish / chicken / pork / seafood)' AND source_hospital = 'DIETICIAN'), 'name', 'Lean protein (fish / chicken / pork / seafood)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Curry gravy (spiced, no vegetables/lentils)' AND source_hospital = 'DIETICIAN'), 'name', 'Curry gravy (spiced, no vegetables/lentils)')
  )),
('Chicken curry with rice', ARRAY['lunch']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lean protein (fish / chicken / pork / seafood)' AND source_hospital = 'DIETICIAN'), 'name', 'Lean protein (fish / chicken / pork / seafood)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Curry gravy (spiced, no vegetables/lentils)' AND source_hospital = 'DIETICIAN'), 'name', 'Curry gravy (spiced, no vegetables/lentils)')
  )),
('Fish curry with rice', ARRAY['lunch']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lean protein (fish / chicken / pork / seafood)' AND source_hospital = 'DIETICIAN'), 'name', 'Lean protein (fish / chicken / pork / seafood)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Curry gravy (spiced, no vegetables/lentils)' AND source_hospital = 'DIETICIAN'), 'name', 'Curry gravy (spiced, no vegetables/lentils)')
  )),
('Fish curry with rice', ARRAY['lunch']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lean protein (fish / chicken / pork / seafood)' AND source_hospital = 'DIETICIAN'), 'name', 'Lean protein (fish / chicken / pork / seafood)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Curry gravy (spiced, no vegetables/lentils)' AND source_hospital = 'DIETICIAN'), 'name', 'Curry gravy (spiced, no vegetables/lentils)')
  )),
('Dhal curry with rice', ARRAY['lunch']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Dhal / lentil curry' AND source_hospital = 'DIETICIAN'), 'name', 'Dhal / lentil curry')
  )),
('Dhal curry with rice', ARRAY['lunch']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Dhal / lentil curry' AND source_hospital = 'DIETICIAN'), 'name', 'Dhal / lentil curry')
  )),
('Chapati with paneer curry', ARRAY['lunch']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chapati (plain, not fried)' AND source_hospital = 'DIETICIAN'), 'name', 'Chapati (plain, not fried)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Paneer / cottage cheese' AND source_hospital = 'DIETICIAN'), 'name', 'Paneer / cottage cheese')
  )),
('Chapati with paneer curry', ARRAY['lunch']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chapati (plain, not fried)' AND source_hospital = 'DIETICIAN'), 'name', 'Chapati (plain, not fried)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Paneer / cottage cheese' AND source_hospital = 'DIETICIAN'), 'name', 'Paneer / cottage cheese')
  )),
('Mutton curry with rice', ARRAY['dinner']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Red meat (beef / mutton / duck)' AND source_hospital = 'DIETICIAN'), 'name', 'Red meat (beef / mutton / duck)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Curry gravy (spiced, no vegetables/lentils)' AND source_hospital = 'DIETICIAN'), 'name', 'Curry gravy (spiced, no vegetables/lentils)')
  )),
('Mutton curry with rice', ARRAY['dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Red meat (beef / mutton / duck)' AND source_hospital = 'DIETICIAN'), 'name', 'Red meat (beef / mutton / duck)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Curry gravy (spiced, no vegetables/lentils)' AND source_hospital = 'DIETICIAN'), 'name', 'Curry gravy (spiced, no vegetables/lentils)')
  )),
('Tandoori chicken with chapati', ARRAY['dinner']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chapati (plain, not fried)' AND source_hospital = 'DIETICIAN'), 'name', 'Chapati (plain, not fried)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lean protein (fish / chicken / pork / seafood)' AND source_hospital = 'DIETICIAN'), 'name', 'Lean protein (fish / chicken / pork / seafood)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Curry gravy (spiced, no vegetables/lentils)' AND source_hospital = 'DIETICIAN'), 'name', 'Curry gravy (spiced, no vegetables/lentils)')
  )),
('Tandoori chicken with chapati', ARRAY['dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chapati (plain, not fried)' AND source_hospital = 'DIETICIAN'), 'name', 'Chapati (plain, not fried)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lean protein (fish / chicken / pork / seafood)' AND source_hospital = 'DIETICIAN'), 'name', 'Lean protein (fish / chicken / pork / seafood)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Curry gravy (spiced, no vegetables/lentils)' AND source_hospital = 'DIETICIAN'), 'name', 'Curry gravy (spiced, no vegetables/lentils)')
  )),
('Palak paneer with rice', ARRAY['dinner']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Paneer / cottage cheese' AND source_hospital = 'DIETICIAN'), 'name', 'Paneer / cottage cheese'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),
('Palak paneer with rice', ARRAY['dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Paneer / cottage cheese' AND source_hospital = 'DIETICIAN'), 'name', 'Paneer / cottage cheese'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),
('Prawn curry with rice', ARRAY['dinner']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lean protein (fish / chicken / pork / seafood)' AND source_hospital = 'DIETICIAN'), 'name', 'Lean protein (fish / chicken / pork / seafood)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Curry gravy (spiced, no vegetables/lentils)' AND source_hospital = 'DIETICIAN'), 'name', 'Curry gravy (spiced, no vegetables/lentils)')
  )),
('Prawn curry with rice', ARRAY['dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lean protein (fish / chicken / pork / seafood)' AND source_hospital = 'DIETICIAN'), 'name', 'Lean protein (fish / chicken / pork / seafood)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Curry gravy (spiced, no vegetables/lentils)' AND source_hospital = 'DIETICIAN'), 'name', 'Curry gravy (spiced, no vegetables/lentils)')
  )),
('Rasam rice', ARRAY['dinner']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Rasam (tamarind & lentil soup)' AND source_hospital = 'DIETICIAN'), 'name', 'Rasam (tamarind & lentil soup)')
  )),
('Rasam rice', ARRAY['dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Rasam (tamarind & lentil soup)' AND source_hospital = 'DIETICIAN'), 'name', 'Rasam (tamarind & lentil soup)')
  ));

-- --- MALAY ---
INSERT INTO dishes_tab (name, meal_type, source_hospital, ingredient_list) VALUES
('Nasi lemak with ikan bilis', ARRAY['breakfast']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Coconut milk / dairy / cheese / yoghurt' AND source_hospital = 'DIETICIAN'), 'name', 'Coconut milk / dairy / cheese / yoghurt'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Ikan bilis (fried anchovies)' AND source_hospital = 'DIETICIAN'), 'name', 'Ikan bilis (fried anchovies)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),
('Nasi lemak with ikan bilis', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Coconut milk / dairy / cheese / yoghurt' AND source_hospital = 'DIETICIAN'), 'name', 'Coconut milk / dairy / cheese / yoghurt'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Ikan bilis (fried anchovies)' AND source_hospital = 'DIETICIAN'), 'name', 'Ikan bilis (fried anchovies)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),
('Roti john', ARRAY['breakfast']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain white bread' AND source_hospital = 'DIETICIAN'), 'name', 'Plain white bread'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fried food / deep-fried batter or oil' AND source_hospital = 'DIETICIAN'), 'name', 'Fried food / deep-fried batter or oil'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lean protein (fish / chicken / pork / seafood)' AND source_hospital = 'DIETICIAN'), 'name', 'Lean protein (fish / chicken / pork / seafood)')
  )),
('Roti john', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain white bread' AND source_hospital = 'DIETICIAN'), 'name', 'Plain white bread'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fried food / deep-fried batter or oil' AND source_hospital = 'DIETICIAN'), 'name', 'Fried food / deep-fried batter or oil'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lean protein (fish / chicken / pork / seafood)' AND source_hospital = 'DIETICIAN'), 'name', 'Lean protein (fish / chicken / pork / seafood)')
  )),
('Mee rebus', ARRAY['breakfast']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain noodles (bee hoon / kway teow / mee sua, not fried)' AND source_hospital = 'DIETICIAN'), 'name', 'Plain noodles (bee hoon / kway teow / mee sua, not fried)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Curry gravy (spiced, no vegetables/lentils)' AND source_hospital = 'DIETICIAN'), 'name', 'Curry gravy (spiced, no vegetables/lentils)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Ikan bilis (fried anchovies)' AND source_hospital = 'DIETICIAN'), 'name', 'Ikan bilis (fried anchovies)')
  )),
('Mee rebus', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain noodles (bee hoon / kway teow / mee sua, not fried)' AND source_hospital = 'DIETICIAN'), 'name', 'Plain noodles (bee hoon / kway teow / mee sua, not fried)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Curry gravy (spiced, no vegetables/lentils)' AND source_hospital = 'DIETICIAN'), 'name', 'Curry gravy (spiced, no vegetables/lentils)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Ikan bilis (fried anchovies)' AND source_hospital = 'DIETICIAN'), 'name', 'Ikan bilis (fried anchovies)')
  )),
('Plain roti prata with dhal curry', ARRAY['breakfast']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain roti prata' AND source_hospital = 'DIETICIAN'), 'name', 'Plain roti prata'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Dhal / lentil curry' AND source_hospital = 'DIETICIAN'), 'name', 'Dhal / lentil curry')
  )),
('Plain roti prata with dhal curry', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain roti prata' AND source_hospital = 'DIETICIAN'), 'name', 'Plain roti prata'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Dhal / lentil curry' AND source_hospital = 'DIETICIAN'), 'name', 'Dhal / lentil curry')
  )),
('Bubur lambuk (savoury rice porridge)', ARRAY['breakfast']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lean protein (fish / chicken / pork / seafood)' AND source_hospital = 'DIETICIAN'), 'name', 'Lean protein (fish / chicken / pork / seafood)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),
('Bubur lambuk (savoury rice porridge)', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lean protein (fish / chicken / pork / seafood)' AND source_hospital = 'DIETICIAN'), 'name', 'Lean protein (fish / chicken / pork / seafood)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),
('Nasi lemak with rendang', ARRAY['lunch']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Coconut milk / dairy / cheese / yoghurt' AND source_hospital = 'DIETICIAN'), 'name', 'Coconut milk / dairy / cheese / yoghurt'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Rendang (coconut meat stew)' AND source_hospital = 'DIETICIAN'), 'name', 'Rendang (coconut meat stew)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),
('Nasi lemak with rendang', ARRAY['lunch']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Coconut milk / dairy / cheese / yoghurt' AND source_hospital = 'DIETICIAN'), 'name', 'Coconut milk / dairy / cheese / yoghurt'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Rendang (coconut meat stew)' AND source_hospital = 'DIETICIAN'), 'name', 'Rendang (coconut meat stew)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),
('Mee goreng mamak', ARRAY['lunch']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain noodles (bee hoon / kway teow / mee sua, not fried)' AND source_hospital = 'DIETICIAN'), 'name', 'Plain noodles (bee hoon / kway teow / mee sua, not fried)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fried food / deep-fried batter or oil' AND source_hospital = 'DIETICIAN'), 'name', 'Fried food / deep-fried batter or oil'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),
('Mee goreng mamak', ARRAY['lunch']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain noodles (bee hoon / kway teow / mee sua, not fried)' AND source_hospital = 'DIETICIAN'), 'name', 'Plain noodles (bee hoon / kway teow / mee sua, not fried)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fried food / deep-fried batter or oil' AND source_hospital = 'DIETICIAN'), 'name', 'Fried food / deep-fried batter or oil'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),
('Nasi briyani with curry chicken', ARRAY['lunch']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lean protein (fish / chicken / pork / seafood)' AND source_hospital = 'DIETICIAN'), 'name', 'Lean protein (fish / chicken / pork / seafood)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Curry gravy (spiced, no vegetables/lentils)' AND source_hospital = 'DIETICIAN'), 'name', 'Curry gravy (spiced, no vegetables/lentils)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Nuts, seeds, beans, lentils' AND source_hospital = 'DIETICIAN'), 'name', 'Nuts, seeds, beans, lentils')
  )),
('Nasi briyani with curry chicken', ARRAY['lunch']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lean protein (fish / chicken / pork / seafood)' AND source_hospital = 'DIETICIAN'), 'name', 'Lean protein (fish / chicken / pork / seafood)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Curry gravy (spiced, no vegetables/lentils)' AND source_hospital = 'DIETICIAN'), 'name', 'Curry gravy (spiced, no vegetables/lentils)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Nuts, seeds, beans, lentils' AND source_hospital = 'DIETICIAN'), 'name', 'Nuts, seeds, beans, lentils')
  )),
('Sambal ikan bilis with rice', ARRAY['lunch']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Sambal / chilli paste' AND source_hospital = 'DIETICIAN'), 'name', 'Sambal / chilli paste'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Ikan bilis (fried anchovies)' AND source_hospital = 'DIETICIAN'), 'name', 'Ikan bilis (fried anchovies)')
  )),
('Sambal ikan bilis with rice', ARRAY['lunch']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Sambal / chilli paste' AND source_hospital = 'DIETICIAN'), 'name', 'Sambal / chilli paste'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Ikan bilis (fried anchovies)' AND source_hospital = 'DIETICIAN'), 'name', 'Ikan bilis (fried anchovies)')
  )),
('Rendang with rice', ARRAY['lunch']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Rendang (coconut meat stew)' AND source_hospital = 'DIETICIAN'), 'name', 'Rendang (coconut meat stew)')
  )),
('Rendang with rice', ARRAY['lunch']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Rendang (coconut meat stew)' AND source_hospital = 'DIETICIAN'), 'name', 'Rendang (coconut meat stew)')
  )),
('Satay with peanut sauce', ARRAY['dinner']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Satay (grilled skewered meat, no sauce)' AND source_hospital = 'DIETICIAN'), 'name', 'Satay (grilled skewered meat, no sauce)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Nuts, seeds, beans, lentils' AND source_hospital = 'DIETICIAN'), 'name', 'Nuts, seeds, beans, lentils')
  )),
('Satay with peanut sauce', ARRAY['dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Satay (grilled skewered meat, no sauce)' AND source_hospital = 'DIETICIAN'), 'name', 'Satay (grilled skewered meat, no sauce)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Nuts, seeds, beans, lentils' AND source_hospital = 'DIETICIAN'), 'name', 'Nuts, seeds, beans, lentils')
  )),
('Ayam masak merah with rice', ARRAY['dinner']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lean protein (fish / chicken / pork / seafood)' AND source_hospital = 'DIETICIAN'), 'name', 'Lean protein (fish / chicken / pork / seafood)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Sambal / chilli paste' AND source_hospital = 'DIETICIAN'), 'name', 'Sambal / chilli paste')
  )),
('Ayam masak merah with rice', ARRAY['dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lean protein (fish / chicken / pork / seafood)' AND source_hospital = 'DIETICIAN'), 'name', 'Lean protein (fish / chicken / pork / seafood)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Sambal / chilli paste' AND source_hospital = 'DIETICIAN'), 'name', 'Sambal / chilli paste')
  )),
('Otah with rice', ARRAY['dinner']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lean protein (fish / chicken / pork / seafood)' AND source_hospital = 'DIETICIAN'), 'name', 'Lean protein (fish / chicken / pork / seafood)')
  )),
('Otah with rice', ARRAY['dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lean protein (fish / chicken / pork / seafood)' AND source_hospital = 'DIETICIAN'), 'name', 'Lean protein (fish / chicken / pork / seafood)')
  )),
('Beef rendang with rice', ARRAY['dinner']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Red meat (beef / mutton / duck)' AND source_hospital = 'DIETICIAN'), 'name', 'Red meat (beef / mutton / duck)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Rendang (coconut meat stew)' AND source_hospital = 'DIETICIAN'), 'name', 'Rendang (coconut meat stew)')
  )),
('Beef rendang with rice', ARRAY['dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Red meat (beef / mutton / duck)' AND source_hospital = 'DIETICIAN'), 'name', 'Red meat (beef / mutton / duck)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Rendang (coconut meat stew)' AND source_hospital = 'DIETICIAN'), 'name', 'Rendang (coconut meat stew)')
  )),
('Grilled fish with sambal and rice', ARRAY['dinner']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lean protein (fish / chicken / pork / seafood)' AND source_hospital = 'DIETICIAN'), 'name', 'Lean protein (fish / chicken / pork / seafood)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Sambal / chilli paste' AND source_hospital = 'DIETICIAN'), 'name', 'Sambal / chilli paste')
  )),
('Grilled fish with sambal and rice', ARRAY['dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lean protein (fish / chicken / pork / seafood)' AND source_hospital = 'DIETICIAN'), 'name', 'Lean protein (fish / chicken / pork / seafood)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Sambal / chilli paste' AND source_hospital = 'DIETICIAN'), 'name', 'Sambal / chilli paste')
  ));

-- --- VEGETARIAN ---
INSERT INTO dishes_tab (name, meal_type, source_hospital, ingredient_list) VALUES
('Vegetable thosai', ARRAY['breakfast']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain thosai' AND source_hospital = 'DIETICIAN'), 'name', 'Plain thosai'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),
('Vegetable thosai', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain thosai' AND source_hospital = 'DIETICIAN'), 'name', 'Plain thosai'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),
('Idli with sambar and coconut chutney', ARRAY['breakfast']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Idli' AND source_hospital = 'DIETICIAN'), 'name', 'Idli'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Sambar (lentil & vegetable stew)' AND source_hospital = 'DIETICIAN'), 'name', 'Sambar (lentil & vegetable stew)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Coconut chutney' AND source_hospital = 'DIETICIAN'), 'name', 'Coconut chutney')
  )),
('Idli with sambar and coconut chutney', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Idli' AND source_hospital = 'DIETICIAN'), 'name', 'Idli'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Sambar (lentil & vegetable stew)' AND source_hospital = 'DIETICIAN'), 'name', 'Sambar (lentil & vegetable stew)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Coconut chutney' AND source_hospital = 'DIETICIAN'), 'name', 'Coconut chutney')
  )),
('Vegetable upma', ARRAY['breakfast']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Upma (semolina porridge, plain)' AND source_hospital = 'DIETICIAN'), 'name', 'Upma (semolina porridge, plain)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),
('Vegetable upma', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Upma (semolina porridge, plain)' AND source_hospital = 'DIETICIAN'), 'name', 'Upma (semolina porridge, plain)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),
('Mock meat congee', ARRAY['breakfast']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Mock meat (soy-based vegetarian protein)' AND source_hospital = 'DIETICIAN'), 'name', 'Mock meat (soy-based vegetarian protein)')
  )),
('Mock meat congee', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Mock meat (soy-based vegetarian protein)' AND source_hospital = 'DIETICIAN'), 'name', 'Mock meat (soy-based vegetarian protein)')
  )),
('Roti prata with vegetable dhal', ARRAY['breakfast']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain roti prata' AND source_hospital = 'DIETICIAN'), 'name', 'Plain roti prata'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Dhal / lentil curry' AND source_hospital = 'DIETICIAN'), 'name', 'Dhal / lentil curry')
  )),
('Roti prata with vegetable dhal', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain roti prata' AND source_hospital = 'DIETICIAN'), 'name', 'Plain roti prata'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Dhal / lentil curry' AND source_hospital = 'DIETICIAN'), 'name', 'Dhal / lentil curry')
  )),
('Vegetable biryani with mock meat', ARRAY['lunch']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Mock meat (soy-based vegetarian protein)' AND source_hospital = 'DIETICIAN'), 'name', 'Mock meat (soy-based vegetarian protein)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Nuts, seeds, beans, lentils' AND source_hospital = 'DIETICIAN'), 'name', 'Nuts, seeds, beans, lentils')
  )),
('Vegetable biryani with mock meat', ARRAY['lunch']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Mock meat (soy-based vegetarian protein)' AND source_hospital = 'DIETICIAN'), 'name', 'Mock meat (soy-based vegetarian protein)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Nuts, seeds, beans, lentils' AND source_hospital = 'DIETICIAN'), 'name', 'Nuts, seeds, beans, lentils')
  )),
('Tofu and vegetable stir-fry with rice', ARRAY['lunch']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fried food / deep-fried batter or oil' AND source_hospital = 'DIETICIAN'), 'name', 'Fried food / deep-fried batter or oil'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain tofu / taukwa' AND source_hospital = 'DIETICIAN'), 'name', 'Plain tofu / taukwa'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),
('Tofu and vegetable stir-fry with rice', ARRAY['lunch']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fried food / deep-fried batter or oil' AND source_hospital = 'DIETICIAN'), 'name', 'Fried food / deep-fried batter or oil'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain tofu / taukwa' AND source_hospital = 'DIETICIAN'), 'name', 'Plain tofu / taukwa'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),
('Tempeh curry with rice', ARRAY['lunch']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Tempeh' AND source_hospital = 'DIETICIAN'), 'name', 'Tempeh'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Curry gravy (spiced, no vegetables/lentils)' AND source_hospital = 'DIETICIAN'), 'name', 'Curry gravy (spiced, no vegetables/lentils)')
  )),
('Tempeh curry with rice', ARRAY['lunch']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Tempeh' AND source_hospital = 'DIETICIAN'), 'name', 'Tempeh'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Curry gravy (spiced, no vegetables/lentils)' AND source_hospital = 'DIETICIAN'), 'name', 'Curry gravy (spiced, no vegetables/lentils)')
  )),
('Paneer butter masala with rice', ARRAY['lunch']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Paneer / cottage cheese' AND source_hospital = 'DIETICIAN'), 'name', 'Paneer / cottage cheese'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Curry gravy (spiced, no vegetables/lentils)' AND source_hospital = 'DIETICIAN'), 'name', 'Curry gravy (spiced, no vegetables/lentils)')
  )),
('Paneer butter masala with rice', ARRAY['lunch']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Paneer / cottage cheese' AND source_hospital = 'DIETICIAN'), 'name', 'Paneer / cottage cheese'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Curry gravy (spiced, no vegetables/lentils)' AND source_hospital = 'DIETICIAN'), 'name', 'Curry gravy (spiced, no vegetables/lentils)')
  )),
('Vegetarian yong tau foo (tofu and vegetables)', ARRAY['lunch']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain tofu / taukwa' AND source_hospital = 'DIETICIAN'), 'name', 'Plain tofu / taukwa'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),
('Vegetarian yong tau foo (tofu and vegetables)', ARRAY['lunch']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain tofu / taukwa' AND source_hospital = 'DIETICIAN'), 'name', 'Plain tofu / taukwa'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),
('Mock meat rendang with rice', ARRAY['dinner']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Mock meat (soy-based vegetarian protein)' AND source_hospital = 'DIETICIAN'), 'name', 'Mock meat (soy-based vegetarian protein)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Rendang (coconut meat stew)' AND source_hospital = 'DIETICIAN'), 'name', 'Rendang (coconut meat stew)')
  )),
('Mock meat rendang with rice', ARRAY['dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Mock meat (soy-based vegetarian protein)' AND source_hospital = 'DIETICIAN'), 'name', 'Mock meat (soy-based vegetarian protein)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Rendang (coconut meat stew)' AND source_hospital = 'DIETICIAN'), 'name', 'Rendang (coconut meat stew)')
  )),
('Dhal curry with chapati', ARRAY['dinner']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chapati (plain, not fried)' AND source_hospital = 'DIETICIAN'), 'name', 'Chapati (plain, not fried)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Dhal / lentil curry' AND source_hospital = 'DIETICIAN'), 'name', 'Dhal / lentil curry')
  )),
('Dhal curry with chapati', ARRAY['dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chapati (plain, not fried)' AND source_hospital = 'DIETICIAN'), 'name', 'Chapati (plain, not fried)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Dhal / lentil curry' AND source_hospital = 'DIETICIAN'), 'name', 'Dhal / lentil curry')
  )),
('Vegetable curry with rice', ARRAY['dinner']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Curry gravy (spiced, no vegetables/lentils)' AND source_hospital = 'DIETICIAN'), 'name', 'Curry gravy (spiced, no vegetables/lentils)')
  )),
('Vegetable curry with rice', ARRAY['dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Curry gravy (spiced, no vegetables/lentils)' AND source_hospital = 'DIETICIAN'), 'name', 'Curry gravy (spiced, no vegetables/lentils)')
  )),
('Beancurd skin and vegetable soup with rice', ARRAY['dinner']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Beancurd skin (tau kee)' AND source_hospital = 'DIETICIAN'), 'name', 'Beancurd skin (tau kee)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),
('Beancurd skin and vegetable soup with rice', ARRAY['dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Beancurd skin (tau kee)' AND source_hospital = 'DIETICIAN'), 'name', 'Beancurd skin (tau kee)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),
('Mushroom and tofu claypot with rice', ARRAY['dinner']::dish_meal_type[], 'SGH',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Mushroom' AND source_hospital = 'DIETICIAN'), 'name', 'Mushroom'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain tofu / taukwa' AND source_hospital = 'DIETICIAN'), 'name', 'Plain tofu / taukwa')
  )),
('Mushroom and tofu claypot with rice', ARRAY['dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Mushroom' AND source_hospital = 'DIETICIAN'), 'name', 'Mushroom'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain tofu / taukwa' AND source_hospital = 'DIETICIAN'), 'name', 'Plain tofu / taukwa')
  ));

