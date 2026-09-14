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
('Plain white bread', 'breakfast', 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain white bread' AND source_hospital = 'DIETICIAN'), 'name', 'Plain white bread'))),
('Kaya toast', 'breakfast', 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain white bread' AND source_hospital = 'DIETICIAN'), 'name', 'Plain white bread'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Kaya / butter / jam spread' AND source_hospital = 'DIETICIAN'), 'name', 'Kaya / butter / jam spread')
  )),
('Plain porridge (fish or chicken)', 'breakfast', 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lean protein (fish / chicken / pork / seafood)' AND source_hospital = 'DIETICIAN'), 'name', 'Lean protein (fish / chicken / pork / seafood)')
  )),
('Plain thosai', 'breakfast', 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain thosai' AND source_hospital = 'DIETICIAN'), 'name', 'Plain thosai'))),
('Idli', 'breakfast', 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Idli' AND source_hospital = 'DIETICIAN'), 'name', 'Idli'))),
('Idiyappam / putu mayam', 'breakfast', 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Idiyappam / putu mayam' AND source_hospital = 'DIETICIAN'), 'name', 'Idiyappam / putu mayam'))),
('Plain roti prata', 'breakfast', 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain roti prata' AND source_hospital = 'DIETICIAN'), 'name', 'Plain roti prata'))),
('Steamed egg with rice', 'breakfast', 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Steamed / boiled egg' AND source_hospital = 'DIETICIAN'), 'name', 'Steamed / boiled egg')
  )),

('Chicken rice (with cucumber garnish)', 'lunch', 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lean protein (fish / chicken / pork / seafood)' AND source_hospital = 'DIETICIAN'), 'name', 'Lean protein (fish / chicken / pork / seafood)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),
('Steamed fish with rice', 'lunch', 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lean protein (fish / chicken / pork / seafood)' AND source_hospital = 'DIETICIAN'), 'name', 'Lean protein (fish / chicken / pork / seafood)')
  )),
('Yong tau foo (with vegetables)', 'lunch', 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain tofu / taukwa' AND source_hospital = 'DIETICIAN'), 'name', 'Plain tofu / taukwa'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fishcake' AND source_hospital = 'DIETICIAN'), 'name', 'Fishcake'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),
('Yong tau foo (fishcake and tofu only)', 'lunch', 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain tofu / taukwa' AND source_hospital = 'DIETICIAN'), 'name', 'Plain tofu / taukwa'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fishcake' AND source_hospital = 'DIETICIAN'), 'name', 'Fishcake')
  )),
('Plain noodle soup', 'lunch', 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain noodles (bee hoon / kway teow / mee sua, not fried)' AND source_hospital = 'DIETICIAN'), 'name', 'Plain noodles (bee hoon / kway teow / mee sua, not fried)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lean protein (fish / chicken / pork / seafood)' AND source_hospital = 'DIETICIAN'), 'name', 'Lean protein (fish / chicken / pork / seafood)')
  )),
('Char kway teow', 'lunch', 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain noodles (bee hoon / kway teow / mee sua, not fried)' AND source_hospital = 'DIETICIAN'), 'name', 'Plain noodles (bee hoon / kway teow / mee sua, not fried)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fried food / deep-fried batter or oil' AND source_hospital = 'DIETICIAN'), 'name', 'Fried food / deep-fried batter or oil')
  )),
('Mee goreng', 'lunch', 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain noodles (bee hoon / kway teow / mee sua, not fried)' AND source_hospital = 'DIETICIAN'), 'name', 'Plain noodles (bee hoon / kway teow / mee sua, not fried)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fried food / deep-fried batter or oil' AND source_hospital = 'DIETICIAN'), 'name', 'Fried food / deep-fried batter or oil'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)')
  )),

('Tofu with rice', 'dinner', 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain tofu / taukwa' AND source_hospital = 'DIETICIAN'), 'name', 'Plain tofu / taukwa')
  )),
('Nasi lemak', 'dinner', 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetables (incl. garnishes such as cucumber)' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetables (incl. garnishes such as cucumber)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fried food / deep-fried batter or oil' AND source_hospital = 'DIETICIAN'), 'name', 'Fried food / deep-fried batter or oil'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Coconut milk / dairy / cheese / yoghurt' AND source_hospital = 'DIETICIAN'), 'name', 'Coconut milk / dairy / cheese / yoghurt')
  )),
('Beef noodles', 'dinner', 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain noodles (bee hoon / kway teow / mee sua, not fried)' AND source_hospital = 'DIETICIAN'), 'name', 'Plain noodles (bee hoon / kway teow / mee sua, not fried)'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Red meat (beef / mutton / duck)' AND source_hospital = 'DIETICIAN'), 'name', 'Red meat (beef / mutton / duck)')
  )),
('Fried egg with rice', 'dinner', 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'DIETICIAN'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fried food / deep-fried batter or oil' AND source_hospital = 'DIETICIAN'), 'name', 'Fried food / deep-fried batter or oil')
  )),

('100Plus / colourless isotonic or soft drinks', 'any', 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = '100Plus / colourless isotonic or soft drinks' AND source_hospital = 'DIETICIAN'), 'name', '100Plus / colourless isotonic or soft drinks'))),
('Barley water', 'any', 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Barley water (no pearls)' AND source_hospital = 'DIETICIAN'), 'name', 'Barley water (no pearls)'))),
('Plain water', 'any', 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain water' AND source_hospital = 'DIETICIAN'), 'name', 'Plain water'))),
('Peeled potato / yam', 'any', 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Peeled potato / yam' AND source_hospital = 'DIETICIAN'), 'name', 'Peeled potato / yam')));

-- === Dishes: hospital-specific (mirrors the ingredient conflicts above) ==

INSERT INTO dishes_tab (name, meal_type, source_hospital, ingredient_list) VALUES
('Kopi-O / Teh-O', 'any', 'SGH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Kopi-O / Teh-O (no milk)' AND source_hospital = 'SGH'), 'name', 'Kopi-O / Teh-O (no milk)'))),
('Kopi-O / Teh-O', 'any', 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Kopi-O / Teh-O (no milk)' AND source_hospital = 'TTSH'), 'name', 'Kopi-O / Teh-O (no milk)'))),
('Kopi-O / Teh-O', 'any', 'CGH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Kopi-O / Teh-O (no milk)' AND source_hospital = 'CGH'), 'name', 'Kopi-O / Teh-O (no milk)'))),
('Kopi-O / Teh-O', 'any', 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Kopi-O / Teh-O (no milk)' AND source_hospital = 'DIETICIAN'), 'name', 'Kopi-O / Teh-O (no milk)'))),

('Kopi / Teh with milk', 'any', 'SGH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Kopi / Teh with milk' AND source_hospital = 'SGH'), 'name', 'Kopi / Teh with milk'))),
('Kopi / Teh with milk', 'any', 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Kopi / Teh with milk' AND source_hospital = 'TTSH'), 'name', 'Kopi / Teh with milk'))),
('Kopi / Teh with milk', 'any', 'CGH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Kopi / Teh with milk' AND source_hospital = 'CGH'), 'name', 'Kopi / Teh with milk'))),
('Kopi / Teh with milk', 'any', 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Kopi / Teh with milk' AND source_hospital = 'DIETICIAN'), 'name', 'Kopi / Teh with milk'))),

('Apple juice', 'any', 'SGH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Apple juice / fruit juice' AND source_hospital = 'SGH'), 'name', 'Apple juice / fruit juice'))),
('Apple juice', 'any', 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Apple juice / fruit juice' AND source_hospital = 'TTSH'), 'name', 'Apple juice / fruit juice'))),
('Apple juice', 'any', 'CGH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Apple juice / fruit juice' AND source_hospital = 'CGH'), 'name', 'Apple juice / fruit juice'))),
('Apple juice', 'any', 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Apple juice / fruit juice' AND source_hospital = 'DIETICIAN'), 'name', 'Apple juice / fruit juice'))),

('Milo', 'any', 'SGH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Milo / Horlicks / Ovaltine' AND source_hospital = 'SGH'), 'name', 'Milo / Horlicks / Ovaltine'))),
('Milo', 'any', 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Milo / Horlicks / Ovaltine' AND source_hospital = 'TTSH'), 'name', 'Milo / Horlicks / Ovaltine'))),
('Milo', 'any', 'CGH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Milo / Horlicks / Ovaltine' AND source_hospital = 'CGH'), 'name', 'Milo / Horlicks / Ovaltine'))),
('Milo', 'any', 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Milo / Horlicks / Ovaltine' AND source_hospital = 'DIETICIAN'), 'name', 'Milo / Horlicks / Ovaltine')));
