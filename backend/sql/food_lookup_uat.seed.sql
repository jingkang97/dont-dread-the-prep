-- Seed for ingredient_tab / dishes_tab — UAT dataset.
-- Generated from the two hackathon sheets (ingredient_tab.csv, dish_tab.csv),
-- both headed "WORKING HACKATHON DATASET — REQUIRES CLINICAL VALIDATION".
-- Nothing here is clinically signed off: it is UAT fixture data.
--
-- Source tiering — the one real difference from food_lookup.seed.sql: a row
-- whose Source column cites TTSH / Tan Tock Seng Hospital is seeded on the
-- TTSH tier; every other row goes to DIETICIAN, the tier the app falls back
-- to when no hospital-specific row exists (see food.py hospital_source).
--   ingredient_tab: 58 TTSH + 104 DIETICIAN = 162 rows
--   dishes_tab:     58 TTSH + 225 DIETICIAN = 283 rows (every row of dish_tab.csv:
--                   162 single-ingredient entries + 121 composite dishes)
--
-- Column mapping
--   ingredient_tab.name                  <- Ingredient (first letter capitalised)
--   ingredient_tab.classification        <- Classification (CAN/CANNOT/REVIEW)
--   ingredient_tab.classification_reason <- Why, and only Why: this is the line
--                                           shown on the food card, so it stays short
--   ingredient_tab.source_document       <- Source (hospital names shortened), the
--                                           Evidence Level / Evidence Conflict /
--                                           Human Review flags, and the reviewer-facing
--                                           Conditions / Ambiguity / governance question
--                                           (the UI never renders this column)
--   dishes_tab.ingredient_list           <- Key Ingredients, resolved to ingredient_tab
--                                           rows on the tier that ingredient was seeded on
--
-- Judgement calls worth a reviewer's eye
--   1. dish_meal_type has no column in either sheet, so meal_type is derived:
--      Category for the single-ingredient rows, dish-name keywords for the
--      composite dishes (prata/toast/porridge -> breakfast, kueh/dessert -> snack,
--      juice/drink -> drink, everything else -> lunch + dinner).
--   2. dish_tab.csv's own Classification (incl. MODIFY, which food_classification
--      has no value for) is not stored — dishes_tab has no classification column
--      and food.py derives the dish verdict from its ingredients. The sheet's
--      ruling is kept as an inline comment on each composite dish so a reviewer
--      can compare it against what the app will actually say.
--   3. 6 dishes list only unitemisable components ("varies", "seasoning",
--      "wheat wrapper") and would otherwise resolve to an all-'can' ingredient
--      list, i.e. the app would recommend them outright. They get the guard
--      ingredient below so they land on 'review', matching the sheet.
--   4. Where the sheet's dish ruling and the derived verdict disagree, the
--      derived one is the stricter of the two — e.g. Idli is CAN on the sheet
--      but lists 'lentils' (CANNOT) as a key ingredient. Left as-is: erring
--      strict is the safe direction, but both rows need clinical validation.
--   5. dish_tab.csv DSH-092 (Water) is dropped: dishes_tab is UNIQUE (name,
--      source_hospital) and ING-129 already seeds that name on the DIETICIAN tier,
--      with the same meal_type and the same single ingredient.
--
-- Assumes ingredient_tab / dishes_tab are empty (both have UNIQUE (name,
-- source_hospital), and these lowercase-sourced names do not collide with the
-- names in food_lookup.seed.sql). To reseed a UAT box, clear them first:
--   DELETE FROM dishes_tab; DELETE FROM ingredient_tab;

-- === Ingredients: TTSH tier ============================================
-- The TTSH PEG patient guide is one of the sheets cited by these rows.

INSERT INTO ingredient_tab (name, classification, classification_reason, source_hospital, source_document) VALUES
-- Grains / carbohydrates
('White rice', 'can', 'Refined white starches are directly listed as permitted in Singapore low-fibre/low-residue guidance.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide; CGH Preparing for Colonoscopy [evidence B] Conditions: Use the plain/refined form described; once clear-liquid phase begins, solid foods are no longer suitable.'),
('White porridge', 'can', 'Refined white starches are directly listed as permitted in Singapore low-fibre/low-residue guidance.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide; CGH Preparing for Colonoscopy [evidence B] Conditions: Use the plain/refined form described; once clear-liquid phase begins, solid foods are no longer suitable.'),
('Bee hoon', 'can', 'Refined white starches are directly listed as permitted in Singapore low-fibre/low-residue guidance.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide; CGH Preparing for Colonoscopy [evidence B] Conditions: Use the plain/refined form described; once clear-liquid phase begins, solid foods are no longer suitable.'),
('Kway teow', 'can', 'Refined white starches are directly listed as permitted in Singapore low-fibre/low-residue guidance.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide; CGH Preparing for Colonoscopy [evidence B] Conditions: Use the plain/refined form described; once clear-liquid phase begins, solid foods are no longer suitable.'),
('Mee sua', 'can', 'Refined white starches are directly listed as permitted in Singapore low-fibre/low-residue guidance.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide; CGH Preparing for Colonoscopy [evidence B] Conditions: Use the plain/refined form described; once clear-liquid phase begins, solid foods are no longer suitable.'),
('White bread', 'can', 'Refined white starches are directly listed as permitted in Singapore low-fibre/low-residue guidance.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide; CGH Preparing for Colonoscopy [evidence B] Conditions: Use the plain/refined form described; once clear-liquid phase begins, solid foods are no longer suitable.'),
('Plain crackers', 'can', 'Refined white starches are directly listed as permitted in Singapore low-fibre/low-residue guidance.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide; CGH Preparing for Colonoscopy [evidence B] Conditions: Use the plain/refined form described; once clear-liquid phase begins, solid foods are no longer suitable.'),
('Plain biscuits', 'can', 'Refined white starches are directly listed as permitted in Singapore low-fibre/low-residue guidance.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide; CGH Preparing for Colonoscopy [evidence B] Conditions: Use the plain/refined form described; once clear-liquid phase begins, solid foods are no longer suitable.'),
('Rice cereal', 'can', 'Refined white starches are directly listed as permitted in Singapore low-fibre/low-residue guidance.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide; CGH Preparing for Colonoscopy [evidence B] Conditions: Use the plain/refined form described; once clear-liquid phase begins, solid foods are no longer suitable.'),
('Yellow noodles', 'can', 'Refined white starches are directly listed as permitted in Singapore low-fibre/low-residue guidance.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide; CGH Preparing for Colonoscopy [evidence B] Conditions: Use the plain/refined form described; once clear-liquid phase begins, solid foods are no longer suitable. Ambiguity: Check that the product is made from refined flour and has no wholegrain/seed additions.'),
('Mee pok', 'can', 'Refined white starches are directly listed as permitted in Singapore low-fibre/low-residue guidance.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide; CGH Preparing for Colonoscopy [evidence B] Conditions: Use the plain/refined form described; once clear-liquid phase begins, solid foods are no longer suitable. Ambiguity: Check that the product is made from refined flour and has no wholegrain/seed additions.'),
('Mee kia', 'can', 'Refined white starches are directly listed as permitted in Singapore low-fibre/low-residue guidance.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide; CGH Preparing for Colonoscopy [evidence B] Conditions: Use the plain/refined form described; once clear-liquid phase begins, solid foods are no longer suitable. Ambiguity: Check that the product is made from refined flour and has no wholegrain/seed additions.'),
('Pasta', 'can', 'Refined white starches are directly listed as permitted in Singapore low-fibre/low-residue guidance.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide; CGH Preparing for Colonoscopy [evidence B] Conditions: Use the plain/refined form described; once clear-liquid phase begins, solid foods are no longer suitable. Ambiguity: Check that the product is made from refined flour and has no wholegrain/seed additions.'),
('Brown rice', 'cannot', 'Whole grains, oats, bran and similar high-fibre cereals are directly excluded.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise.'),
('Brown rice porridge', 'cannot', 'Whole grains, oats, bran and similar high-fibre cereals are directly excluded.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise.'),
('Wholemeal bread', 'cannot', 'Whole grains, oats, bran and similar high-fibre cereals are directly excluded.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise.'),
('Wholegrain bread', 'cannot', 'Whole grains, oats, bran and similar high-fibre cereals are directly excluded.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise.'),
('Chapati', 'cannot', 'Whole grains, oats, bran and similar high-fibre cereals are directly excluded.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise.'),
('Oats', 'cannot', 'Whole grains, oats, bran and similar high-fibre cereals are directly excluded.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise.'),
('Barley', 'cannot', 'Whole grains, oats, bran and similar high-fibre cereals are directly excluded.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise.'),
('Muesli', 'cannot', 'Whole grains, oats, bran and similar high-fibre cereals are directly excluded.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise.'),
('Popcorn', 'cannot', 'Whole grains, oats, bran and similar high-fibre cereals are directly excluded.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise.'),
('Bran cereal', 'cannot', 'Whole grains, oats, bran and similar high-fibre cereals are directly excluded.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise.'),
('Plain prata', 'review', 'Refined-flour items may be low fibre, but the specific local item is not directly addressed and preparation/fat can matter.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — NUH colonoscopy booklet; TTSH PEG patient guide [evidence E; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Ambiguity: Fat/oil content and flour type vary. Governance question: Is this refined-flour item acceptable when plain and without high-fibre fillings/garnishes?.'),
('Plain naan', 'review', 'Refined-flour items may be low fibre, but the specific local item is not directly addressed and preparation/fat can matter.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — NUH colonoscopy booklet; TTSH PEG patient guide [evidence E; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Ambiguity: Fat/oil content and flour type vary. Governance question: Is this refined-flour item acceptable when plain and without high-fibre fillings/garnishes?.'),
('Plain pancake', 'review', 'Refined-flour items may be low fibre, but the specific local item is not directly addressed and preparation/fat can matter.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — NUH colonoscopy booklet; TTSH PEG patient guide [evidence E; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Ambiguity: Fat/oil content and flour type vary. Governance question: Is this refined-flour item acceptable when plain and without high-fibre fillings/garnishes?.'),
('Plain waffle', 'review', 'Refined-flour items may be low fibre, but the specific local item is not directly addressed and preparation/fat can matter.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — NUH colonoscopy booklet; TTSH PEG patient guide [evidence E; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Ambiguity: Fat/oil content and flour type vary. Governance question: Is this refined-flour item acceptable when plain and without high-fibre fillings/garnishes?.'),
-- Protein
('Chicken', 'can', 'Chicken, fish, eggs and seafood are directly permitted in multiple Singapore protocols.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; TTSH PEG patient guide; CGH Preparing for Colonoscopy [evidence B] Conditions: Use the plain/refined form described; once clear-liquid phase begins, solid foods are no longer suitable.'),
('Fish', 'can', 'Chicken, fish, eggs and seafood are directly permitted in multiple Singapore protocols.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; TTSH PEG patient guide; CGH Preparing for Colonoscopy [evidence B] Conditions: Use the plain/refined form described; once clear-liquid phase begins, solid foods are no longer suitable.'),
('Prawns', 'can', 'Chicken, fish, eggs and seafood are directly permitted in multiple Singapore protocols.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; TTSH PEG patient guide; CGH Preparing for Colonoscopy [evidence B] Conditions: Use the plain/refined form described; once clear-liquid phase begins, solid foods are no longer suitable.'),
('Squid', 'can', 'Chicken, fish, eggs and seafood are directly permitted in multiple Singapore protocols.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; TTSH PEG patient guide; CGH Preparing for Colonoscopy [evidence B] Conditions: Use the plain/refined form described; once clear-liquid phase begins, solid foods are no longer suitable.'),
('Egg', 'can', 'Chicken, fish, eggs and seafood are directly permitted in multiple Singapore protocols.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; TTSH PEG patient guide; CGH Preparing for Colonoscopy [evidence B] Conditions: Use the plain/refined form described; once clear-liquid phase begins, solid foods are no longer suitable.'),
('Shellfish', 'can', 'Chicken, fish, eggs and seafood are directly permitted in multiple Singapore protocols.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; TTSH PEG patient guide; CGH Preparing for Colonoscopy [evidence B] Conditions: Use the plain/refined form described; once clear-liquid phase begins, solid foods are no longer suitable.'),
-- Fats / condiments
('Cooking oil', 'review', 'Butter/oil are allowed in NUH paediatric guidance, while TTSH advises avoiding oily foods; adult Singapore guidance is not uniform on amount/preparation.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — NUH paediatric diet; TTSH PEG patient guide [evidence F; evidence conflict; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Governance question: Are small amounts of butter/oil/mayonnaise acceptable in the adult low-residue phase, and are fried/oily dishes excluded?.'),
('Butter', 'review', 'Butter/oil are allowed in NUH paediatric guidance, while TTSH advises avoiding oily foods; adult Singapore guidance is not uniform on amount/preparation.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — NUH paediatric diet; TTSH PEG patient guide [evidence F; evidence conflict; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Governance question: Are small amounts of butter/oil/mayonnaise acceptable in the adult low-residue phase, and are fried/oily dishes excluded?.'),
('Mayonnaise', 'review', 'Butter/oil are allowed in NUH paediatric guidance, while TTSH advises avoiding oily foods; adult Singapore guidance is not uniform on amount/preparation.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — NUH paediatric diet; TTSH PEG patient guide [evidence F; evidence conflict; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Governance question: Are small amounts of butter/oil/mayonnaise acceptable in the adult low-residue phase, and are fried/oily dishes excluded?.'),
-- Coconut / condiments
('Coconut milk', 'review', 'Coconut milk/flesh and kaya are not directly resolved by the reviewed adult Singapore colonoscopy sources; coconut flesh is fibrous and milk may be treated differently by protocol.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; TTSH PEG patient guide [evidence F; evidence conflict; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Governance question: How should coconut milk, coconut flesh and kaya be classified during the low-residue phase?.'),
('Coconut flesh', 'review', 'Coconut milk/flesh and kaya are not directly resolved by the reviewed adult Singapore colonoscopy sources; coconut flesh is fibrous and milk may be treated differently by protocol.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; TTSH PEG patient guide [evidence F; evidence conflict; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Governance question: How should coconut milk, coconut flesh and kaya be classified during the low-residue phase?.'),
('Kaya', 'review', 'Coconut milk/flesh and kaya are not directly resolved by the reviewed adult Singapore colonoscopy sources; coconut flesh is fibrous and milk may be treated differently by protocol.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; TTSH PEG patient guide [evidence F; evidence conflict; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Governance question: How should coconut milk, coconut flesh and kaya be classified during the low-residue phase?.'),
-- Dairy
('Fresh milk', 'review', 'NUH and SKH avoid milk/milk products, while TTSH permits coffee/tea with or without milk during its 3-day low-fibre phase.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide [evidence F; evidence conflict; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Governance question: Is milk/dairy prohibited throughout the low-residue phase under the target protocol, or only once clear liquids are required?.'),
('Yoghurt', 'review', 'NUH and SKH avoid milk/milk products, while TTSH permits coffee/tea with or without milk during its 3-day low-fibre phase.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide [evidence F; evidence conflict; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Governance question: Is milk/dairy prohibited throughout the low-residue phase under the target protocol, or only once clear liquids are required?.'),
('Cheese', 'review', 'NUH and SKH avoid milk/milk products, while TTSH permits coffee/tea with or without milk during its 3-day low-fibre phase.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide [evidence F; evidence conflict; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Governance question: Is milk/dairy prohibited throughout the low-residue phase under the target protocol, or only once clear liquids are required?.'),
('Condensed milk', 'review', 'NUH and SKH avoid milk/milk products, while TTSH permits coffee/tea with or without milk during its 3-day low-fibre phase.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide [evidence F; evidence conflict; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Governance question: Is milk/dairy prohibited throughout the low-residue phase under the target protocol, or only once clear liquids are required?.'),
('Evaporated milk', 'review', 'NUH and SKH avoid milk/milk products, while TTSH permits coffee/tea with or without milk during its 3-day low-fibre phase.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide [evidence F; evidence conflict; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Governance question: Is milk/dairy prohibited throughout the low-residue phase under the target protocol, or only once clear liquids are required?.'),
('Cream', 'review', 'NUH and SKH avoid milk/milk products, while TTSH permits coffee/tea with or without milk during its 3-day low-fibre phase.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide [evidence F; evidence conflict; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Governance question: Is milk/dairy prohibited throughout the low-residue phase under the target protocol, or only once clear liquids are required?.'),
-- Soy drink
('Soy milk', 'review', 'NUH and SKH avoid milk/milk products, while TTSH permits coffee/tea with or without milk during its 3-day low-fibre phase.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide [evidence F; evidence conflict; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Ambiguity: SKH directly excludes soy milk; solid tofu is treated differently. Governance question: Is milk/dairy prohibited throughout the low-residue phase under the target protocol, or only once clear liquids are required?.'),
-- Drinks / coffee & tea
('Kopi-O', 'review', 'NUH permits coffee/tea without milk; SKH lists dark coffee/tea to avoid; TTSH permits coffee/tea with or without milk during low-fibre meals.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide; CGH Preparing for Colonoscopy [evidence F; evidence conflict; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Governance question: Are coffee and tea permitted, with or without milk, during each preparation phase and until what cut-off?.'),
('Teh-O', 'review', 'NUH permits coffee/tea without milk; SKH lists dark coffee/tea to avoid; TTSH permits coffee/tea with or without milk during low-fibre meals.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide; CGH Preparing for Colonoscopy [evidence F; evidence conflict; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Governance question: Are coffee and tea permitted, with or without milk, during each preparation phase and until what cut-off?.'),
('Black coffee', 'review', 'NUH permits coffee/tea without milk; SKH lists dark coffee/tea to avoid; TTSH permits coffee/tea with or without milk during low-fibre meals.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide; CGH Preparing for Colonoscopy [evidence F; evidence conflict; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Governance question: Are coffee and tea permitted, with or without milk, during each preparation phase and until what cut-off?.'),
('Plain tea', 'review', 'NUH permits coffee/tea without milk; SKH lists dark coffee/tea to avoid; TTSH permits coffee/tea with or without milk during low-fibre meals.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide; CGH Preparing for Colonoscopy [evidence F; evidence conflict; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Governance question: Are coffee and tea permitted, with or without milk, during each preparation phase and until what cut-off?.'),
('Kopi', 'review', 'NUH and SKH avoid milk/milk products, while TTSH permits coffee/tea with or without milk during its 3-day low-fibre phase.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide [evidence F; evidence conflict; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Ambiguity: Contains milk/condensed/evaporated milk and coffee/tea; both aspects are protocol-dependent. Governance question: Is milk/dairy prohibited throughout the low-residue phase under the target protocol, or only once clear liquids are required?.'),
('Teh', 'review', 'NUH and SKH avoid milk/milk products, while TTSH permits coffee/tea with or without milk during its 3-day low-fibre phase.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide [evidence F; evidence conflict; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Ambiguity: Contains milk/condensed/evaporated milk and coffee/tea; both aspects are protocol-dependent. Governance question: Is milk/dairy prohibited throughout the low-residue phase under the target protocol, or only once clear liquids are required?.'),
('Kopi-C', 'review', 'NUH and SKH avoid milk/milk products, while TTSH permits coffee/tea with or without milk during its 3-day low-fibre phase.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide [evidence F; evidence conflict; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Ambiguity: Contains milk/condensed/evaporated milk and coffee/tea; both aspects are protocol-dependent. Governance question: Is milk/dairy prohibited throughout the low-residue phase under the target protocol, or only once clear liquids are required?.'),
('Teh-C', 'review', 'NUH and SKH avoid milk/milk products, while TTSH permits coffee/tea with or without milk during its 3-day low-fibre phase.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide [evidence F; evidence conflict; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Ambiguity: Contains milk/condensed/evaporated milk and coffee/tea; both aspects are protocol-dependent. Governance question: Is milk/dairy prohibited throughout the low-residue phase under the target protocol, or only once clear liquids are required?.'),
('Teh tarik', 'review', 'NUH and SKH avoid milk/milk products, while TTSH permits coffee/tea with or without milk during its 3-day low-fibre phase.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide [evidence F; evidence conflict; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Ambiguity: Contains milk/condensed/evaporated milk and coffee/tea; both aspects are protocol-dependent. Governance question: Is milk/dairy prohibited throughout the low-residue phase under the target protocol, or only once clear liquids are required?.'),
-- Drinks
('Barley water', 'cannot', 'Whole grains, oats, bran and similar high-fibre cereals are directly excluded.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Ambiguity: May contain barley solids; not a clear liquid unless fully strained and protocol allows.'),
('Bandung', 'review', 'NUH and SKH avoid milk/milk products, while TTSH permits coffee/tea with or without milk during its 3-day low-fibre phase.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide [evidence F; evidence conflict; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Ambiguity: Milk-based and coloured. Governance question: Is milk/dairy prohibited throughout the low-residue phase under the target protocol, or only once clear liquids are required?.'),
('Soy bean drink', 'review', 'NUH and SKH avoid milk/milk products, while TTSH permits coffee/tea with or without milk during its 3-day low-fibre phase.', 'TTSH', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance; TTSH PEG patient guide [evidence F; evidence conflict; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Governance question: Is milk/dairy prohibited throughout the low-residue phase under the target protocol, or only once clear liquids are required?.');

-- === Ingredients: DIETICIAN tier =======================================
-- No TTSH sheet among the sheets cited by these rows.

INSERT INTO ingredient_tab (name, classification, classification_reason, source_hospital, source_document) VALUES
-- Grains / carbohydrates
('Potato', 'review', 'NUH/HealthHub lists potatoes as allowed simple carbohydrates, while SKH says avoid all vegetables and does not carve out potato.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — NUH bowel-prep guidance; HealthHub (NUH) CRC screening; SKH Diet Advice [evidence F; evidence conflict; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Ambiguity: Does peeling/cooking change the answer?. Governance question: Are peeled potatoes permitted during the low-residue phase under the target protocol?.'),
('Sweet potato', 'cannot', 'Adult SKH/NUH guidance excludes vegetables during the low-residue period.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Ambiguity: Starchy vegetable; not specifically resolved in adult local protocols. Governance question: Are any peeled, well-cooked vegetables permitted under the intended adult protocol, or should all vegetables be excluded?.'),
('Yam / taro', 'cannot', 'Adult SKH/NUH guidance excludes vegetables during the low-residue period.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Ambiguity: Starchy vegetable; not specifically resolved in adult local protocols. Governance question: Are any peeled, well-cooked vegetables permitted under the intended adult protocol, or should all vegetables be excluded?.'),
-- Protein
('Pork', 'can', 'SKH directly lists pork as allowed during its 3-day low-residue phase.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice [evidence C] Conditions: Use the plain/refined form described; once clear-liquid phase begins, solid foods are no longer suitable.'),
('Beef', 'cannot', 'Adult NUH/SKH guidance excludes red meat; NUH explicitly gives duck, beef and mutton as examples.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise.'),
('Mutton / lamb', 'cannot', 'Adult NUH/SKH guidance excludes red meat; NUH explicitly gives duck, beef and mutton as examples.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise.'),
('Duck', 'cannot', 'Adult NUH/SKH guidance excludes red meat; NUH explicitly gives duck, beef and mutton as examples.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise.'),
('Fishball', 'review', 'Processed meats/fish products vary in fillers, seasoning and texture and are not directly listed in the reviewed adult protocols.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet [evidence E; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Ambiguity: Recipe/fillers vary by brand or stall. Governance question: Are smooth processed protein products such as fishball/fishcake/sausage acceptable if they contain no vegetables, seeds or whole grains?.'),
('Fishcake', 'review', 'Processed meats/fish products vary in fillers, seasoning and texture and are not directly listed in the reviewed adult protocols.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet [evidence E; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Ambiguity: Recipe/fillers vary by brand or stall. Governance question: Are smooth processed protein products such as fishball/fishcake/sausage acceptable if they contain no vegetables, seeds or whole grains?.'),
('Sausage', 'review', 'Processed meats/fish products vary in fillers, seasoning and texture and are not directly listed in the reviewed adult protocols.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet [evidence E; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Ambiguity: Recipe/fillers vary by brand or stall. Governance question: Are smooth processed protein products such as fishball/fishcake/sausage acceptable if they contain no vegetables, seeds or whole grains?.'),
('Luncheon meat', 'review', 'Processed meats/fish products vary in fillers, seasoning and texture and are not directly listed in the reviewed adult protocols.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet [evidence E; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Ambiguity: Recipe/fillers vary by brand or stall. Governance question: Are smooth processed protein products such as fishball/fishcake/sausage acceptable if they contain no vegetables, seeds or whole grains?.'),
('Vegetarian mock meat', 'review', 'Processed meats/fish products vary in fillers, seasoning and texture and are not directly listed in the reviewed adult protocols.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet [evidence E; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Ambiguity: Recipe/fillers vary by brand or stall. Governance question: Are smooth processed protein products such as fishball/fishcake/sausage acceptable if they contain no vegetables, seeds or whole grains?.'),
-- Protein / soy
('Tofu', 'can', 'Tofu/taukwa are directly listed as allowed by SKH; tofu also appears in NUH/CGH low-residue examples.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; CGH Preparing for Colonoscopy [evidence B] Conditions: Use the plain/refined form described; once clear-liquid phase begins, solid foods are no longer suitable.'),
('Taukwa', 'can', 'Tofu/taukwa are directly listed as allowed by SKH; tofu also appears in NUH/CGH low-residue examples.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; CGH Preparing for Colonoscopy [evidence B] Conditions: Use the plain/refined form described; once clear-liquid phase begins, solid foods are no longer suitable.'),
('Tau pok', 'can', 'Tofu/taukwa are directly listed as allowed by SKH; tofu also appears in NUH/CGH low-residue examples.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; CGH Preparing for Colonoscopy [evidence B] Conditions: Use the plain/refined form described; once clear-liquid phase begins, solid foods are no longer suitable. Ambiguity: Fried tofu; oil and porous texture differ from plain tofu.'),
('Tempeh', 'cannot', 'SKH directly lists tempeh among foods to avoid.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice [evidence C] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise.'),
-- Legumes / nuts / seeds
('Soybeans', 'cannot', 'Beans, lentils, nuts and seeds are directly excluded in Singapore guidance.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise.'),
('Red beans', 'cannot', 'Beans, lentils, nuts and seeds are directly excluded in Singapore guidance.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise.'),
('Mung beans', 'cannot', 'Beans, lentils, nuts and seeds are directly excluded in Singapore guidance.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise.'),
('Chickpeas', 'cannot', 'Beans, lentils, nuts and seeds are directly excluded in Singapore guidance.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise.'),
('Lentils', 'cannot', 'Beans, lentils, nuts and seeds are directly excluded in Singapore guidance.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise.'),
('Peas', 'cannot', 'Beans, lentils, nuts and seeds are directly excluded in Singapore guidance.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise.'),
('Peanuts', 'cannot', 'Beans, lentils, nuts and seeds are directly excluded in Singapore guidance.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise.'),
('Sesame seeds', 'cannot', 'Beans, lentils, nuts and seeds are directly excluded in Singapore guidance.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise.'),
('Chia seeds', 'cannot', 'Beans, lentils, nuts and seeds are directly excluded in Singapore guidance.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise.'),
('Flax seeds', 'cannot', 'Beans, lentils, nuts and seeds are directly excluded in Singapore guidance.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise.'),
('Sunflower seeds', 'cannot', 'Beans, lentils, nuts and seeds are directly excluded in Singapore guidance.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise.'),
('Pumpkin seeds', 'cannot', 'Beans, lentils, nuts and seeds are directly excluded in Singapore guidance.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise.'),
('Mixed nuts', 'cannot', 'Beans, lentils, nuts and seeds are directly excluded in Singapore guidance.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise.'),
('Smooth peanut butter', 'cannot', 'Beans, lentils, nuts and seeds are directly excluded in Singapore guidance.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH bowel-prep guidance [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Ambiguity: Smooth texture may reduce visible residue, but nuts are excluded by local adult guidance.'),
-- Vegetables / herbs
('Cucumber', 'cannot', 'Adult SKH/NUH guidance excludes vegetables during the low-residue period.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Are any peeled, well-cooked vegetables permitted under the intended adult protocol, or should all vegetables be excluded?.'),
('Tomato', 'cannot', 'Adult SKH/NUH guidance excludes vegetables during the low-residue period.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Are any peeled, well-cooked vegetables permitted under the intended adult protocol, or should all vegetables be excluded?.'),
('Carrot', 'cannot', 'Adult SKH/NUH guidance excludes vegetables during the low-residue period.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Are any peeled, well-cooked vegetables permitted under the intended adult protocol, or should all vegetables be excluded?.'),
('Pumpkin', 'cannot', 'Adult SKH/NUH guidance excludes vegetables during the low-residue period.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Are any peeled, well-cooked vegetables permitted under the intended adult protocol, or should all vegetables be excluded?.'),
('Cabbage', 'cannot', 'Adult SKH/NUH guidance excludes vegetables during the low-residue period.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Are any peeled, well-cooked vegetables permitted under the intended adult protocol, or should all vegetables be excluded?.'),
('Chye sim', 'cannot', 'Adult SKH/NUH guidance excludes vegetables during the low-residue period.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Are any peeled, well-cooked vegetables permitted under the intended adult protocol, or should all vegetables be excluded?.'),
('Kai lan', 'cannot', 'Adult SKH/NUH guidance excludes vegetables during the low-residue period.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Are any peeled, well-cooked vegetables permitted under the intended adult protocol, or should all vegetables be excluded?.'),
('Kang kong', 'cannot', 'Adult SKH/NUH guidance excludes vegetables during the low-residue period.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Are any peeled, well-cooked vegetables permitted under the intended adult protocol, or should all vegetables be excluded?.'),
('Spinach', 'cannot', 'Adult SKH/NUH guidance excludes vegetables during the low-residue period.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Are any peeled, well-cooked vegetables permitted under the intended adult protocol, or should all vegetables be excluded?.'),
('Lettuce', 'cannot', 'Adult SKH/NUH guidance excludes vegetables during the low-residue period.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Are any peeled, well-cooked vegetables permitted under the intended adult protocol, or should all vegetables be excluded?.'),
('Bean sprouts', 'cannot', 'Adult SKH/NUH guidance excludes vegetables during the low-residue period.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Are any peeled, well-cooked vegetables permitted under the intended adult protocol, or should all vegetables be excluded?.'),
('Broccoli', 'cannot', 'Adult SKH/NUH guidance excludes vegetables during the low-residue period.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Are any peeled, well-cooked vegetables permitted under the intended adult protocol, or should all vegetables be excluded?.'),
('Cauliflower', 'cannot', 'Adult SKH/NUH guidance excludes vegetables during the low-residue period.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Are any peeled, well-cooked vegetables permitted under the intended adult protocol, or should all vegetables be excluded?.'),
('French beans', 'cannot', 'Adult SKH/NUH guidance excludes vegetables during the low-residue period.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Are any peeled, well-cooked vegetables permitted under the intended adult protocol, or should all vegetables be excluded?.'),
('Okra', 'cannot', 'Adult SKH/NUH guidance excludes vegetables during the low-residue period.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Are any peeled, well-cooked vegetables permitted under the intended adult protocol, or should all vegetables be excluded?.'),
('Eggplant', 'cannot', 'Adult SKH/NUH guidance excludes vegetables during the low-residue period.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Are any peeled, well-cooked vegetables permitted under the intended adult protocol, or should all vegetables be excluded?.'),
('Bitter gourd', 'cannot', 'Adult SKH/NUH guidance excludes vegetables during the low-residue period.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Are any peeled, well-cooked vegetables permitted under the intended adult protocol, or should all vegetables be excluded?.'),
('Mushrooms', 'cannot', 'Adult SKH/NUH guidance excludes vegetables during the low-residue period.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Are any peeled, well-cooked vegetables permitted under the intended adult protocol, or should all vegetables be excluded?.'),
('Seaweed', 'cannot', 'Adult SKH/NUH guidance excludes vegetables during the low-residue period.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Are any peeled, well-cooked vegetables permitted under the intended adult protocol, or should all vegetables be excluded?.'),
('Onion', 'cannot', 'Adult SKH/NUH guidance excludes vegetables during the low-residue period.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Are any peeled, well-cooked vegetables permitted under the intended adult protocol, or should all vegetables be excluded?.'),
('Garlic', 'cannot', 'Adult SKH/NUH guidance excludes vegetables during the low-residue period.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Are any peeled, well-cooked vegetables permitted under the intended adult protocol, or should all vegetables be excluded?.'),
('Ginger', 'cannot', 'Adult SKH/NUH guidance excludes vegetables during the low-residue period.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Are any peeled, well-cooked vegetables permitted under the intended adult protocol, or should all vegetables be excluded?.'),
('Chilli', 'cannot', 'Adult SKH/NUH guidance excludes vegetables during the low-residue period.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Are any peeled, well-cooked vegetables permitted under the intended adult protocol, or should all vegetables be excluded?.'),
('Spring onion', 'cannot', 'Adult SKH/NUH guidance excludes vegetables during the low-residue period.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Are any peeled, well-cooked vegetables permitted under the intended adult protocol, or should all vegetables be excluded?.'),
('Coriander', 'cannot', 'Adult SKH/NUH guidance excludes vegetables during the low-residue period.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Are any peeled, well-cooked vegetables permitted under the intended adult protocol, or should all vegetables be excluded?.'),
('Laksa leaves', 'cannot', 'Adult SKH/NUH guidance excludes vegetables during the low-residue period.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Are any peeled, well-cooked vegetables permitted under the intended adult protocol, or should all vegetables be excluded?.'),
('Lemongrass', 'cannot', 'Adult SKH/NUH guidance excludes vegetables during the low-residue period.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Are any peeled, well-cooked vegetables permitted under the intended adult protocol, or should all vegetables be excluded?.'),
('Fried shallots', 'cannot', 'Adult SKH/NUH guidance excludes vegetables during the low-residue period.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Are any peeled, well-cooked vegetables permitted under the intended adult protocol, or should all vegetables be excluded?.'),
('Corn', 'cannot', 'Adult SKH/NUH guidance excludes vegetables during the low-residue period.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Are any peeled, well-cooked vegetables permitted under the intended adult protocol, or should all vegetables be excluded?.'),
-- Condiments / sauces
('Soy sauce', 'review', 'Many smooth sauces are low in visible residue but are not directly addressed in adult Singapore colonoscopy instructions.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet [evidence E; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Ambiguity: Small amounts vs colour/ingredients are not directly specified. Governance question: Are smooth seed-free condiments permitted in small amounts during the low-residue phase?.'),
('Dark soy sauce', 'review', 'Many smooth sauces are low in visible residue but are not directly addressed in adult Singapore colonoscopy instructions.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet [evidence E; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Ambiguity: Small amounts vs colour/ingredients are not directly specified. Governance question: Are smooth seed-free condiments permitted in small amounts during the low-residue phase?.'),
('Oyster sauce', 'review', 'Many smooth sauces are low in visible residue but are not directly addressed in adult Singapore colonoscopy instructions.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet [evidence E; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Ambiguity: Small amounts vs colour/ingredients are not directly specified. Governance question: Are smooth seed-free condiments permitted in small amounts during the low-residue phase?.'),
('Tomato ketchup', 'review', 'Many smooth sauces are low in visible residue but are not directly addressed in adult Singapore colonoscopy instructions.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet [evidence E; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Ambiguity: Small amounts vs colour/ingredients are not directly specified. Governance question: Are smooth seed-free condiments permitted in small amounts during the low-residue phase?.'),
('Sweet chilli sauce', 'cannot', 'Adult SKH/NUH guidance excludes vegetables during the low-residue period.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Ambiguity: Often contains chilli, seeds, aromatics or particulate ingredients. Governance question: Are any peeled, well-cooked vegetables permitted under the intended adult protocol, or should all vegetables be excluded?.'),
('Sambal', 'cannot', 'Adult SKH/NUH guidance excludes vegetables during the low-residue period.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Ambiguity: Often contains chilli, seeds, aromatics or particulate ingredients. Governance question: Are any peeled, well-cooked vegetables permitted under the intended adult protocol, or should all vegetables be excluded?.'),
('Curry paste', 'cannot', 'Adult SKH/NUH guidance excludes vegetables during the low-residue period.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Ambiguity: Often contains chilli, seeds, aromatics or particulate ingredients. Governance question: Are any peeled, well-cooked vegetables permitted under the intended adult protocol, or should all vegetables be excluded?.'),
('Laksa paste', 'cannot', 'Adult SKH/NUH guidance excludes vegetables during the low-residue period.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Ambiguity: Often contains chilli, seeds, aromatics or particulate ingredients. Governance question: Are any peeled, well-cooked vegetables permitted under the intended adult protocol, or should all vegetables be excluded?.'),
-- Fruit
('Banana', 'cannot', 'Adult SKH/NUH guidance excludes fruits; paediatric NUH guidance permits selected ripe/cooked fruits, showing protocol/population differences.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Should the adult prototype exclude all fruit during the low-residue phase, despite paediatric NUH guidance allowing selected fruits?.'),
('Papaya', 'cannot', 'Adult SKH/NUH guidance excludes fruits; paediatric NUH guidance permits selected ripe/cooked fruits, showing protocol/population differences.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Should the adult prototype exclude all fruit during the low-residue phase, despite paediatric NUH guidance allowing selected fruits?.'),
('Watermelon', 'cannot', 'Adult SKH/NUH guidance excludes fruits; paediatric NUH guidance permits selected ripe/cooked fruits, showing protocol/population differences.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Should the adult prototype exclude all fruit during the low-residue phase, despite paediatric NUH guidance allowing selected fruits?.'),
('Apple', 'cannot', 'Adult SKH/NUH guidance excludes fruits; paediatric NUH guidance permits selected ripe/cooked fruits, showing protocol/population differences.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Should the adult prototype exclude all fruit during the low-residue phase, despite paediatric NUH guidance allowing selected fruits?.'),
('Orange', 'cannot', 'Adult SKH/NUH guidance excludes fruits; paediatric NUH guidance permits selected ripe/cooked fruits, showing protocol/population differences.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Should the adult prototype exclude all fruit during the low-residue phase, despite paediatric NUH guidance allowing selected fruits?.'),
('Pineapple', 'cannot', 'Adult SKH/NUH guidance excludes fruits; paediatric NUH guidance permits selected ripe/cooked fruits, showing protocol/population differences.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Should the adult prototype exclude all fruit during the low-residue phase, despite paediatric NUH guidance allowing selected fruits?.'),
('Mango', 'cannot', 'Adult SKH/NUH guidance excludes fruits; paediatric NUH guidance permits selected ripe/cooked fruits, showing protocol/population differences.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Should the adult prototype exclude all fruit during the low-residue phase, despite paediatric NUH guidance allowing selected fruits?.'),
('Guava', 'cannot', 'Adult SKH/NUH guidance excludes fruits; paediatric NUH guidance permits selected ripe/cooked fruits, showing protocol/population differences.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Should the adult prototype exclude all fruit during the low-residue phase, despite paediatric NUH guidance allowing selected fruits?.'),
('Pear', 'cannot', 'Adult SKH/NUH guidance excludes fruits; paediatric NUH guidance permits selected ripe/cooked fruits, showing protocol/population differences.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Should the adult prototype exclude all fruit during the low-residue phase, despite paediatric NUH guidance allowing selected fruits?.'),
('Grapes', 'cannot', 'Adult SKH/NUH guidance excludes fruits; paediatric NUH guidance permits selected ripe/cooked fruits, showing protocol/population differences.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Should the adult prototype exclude all fruit during the low-residue phase, despite paediatric NUH guidance allowing selected fruits?.'),
('Berries', 'cannot', 'Adult SKH/NUH guidance excludes fruits; paediatric NUH guidance permits selected ripe/cooked fruits, showing protocol/population differences.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Should the adult prototype exclude all fruit during the low-residue phase, despite paediatric NUH guidance allowing selected fruits?.'),
('Dried fruit', 'cannot', 'Adult SKH/NUH guidance excludes fruits; paediatric NUH guidance permits selected ripe/cooked fruits, showing protocol/population differences.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Should the adult prototype exclude all fruit during the low-residue phase, despite paediatric NUH guidance allowing selected fruits?.'),
('Raisins', 'cannot', 'Adult SKH/NUH guidance excludes fruits; paediatric NUH guidance permits selected ripe/cooked fruits, showing protocol/population differences.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Should the adult prototype exclude all fruit during the low-residue phase, despite paediatric NUH guidance allowing selected fruits?.'),
('Prunes', 'cannot', 'Adult SKH/NUH guidance excludes fruits; paediatric NUH guidance permits selected ripe/cooked fruits, showing protocol/population differences.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Should the adult prototype exclude all fruit during the low-residue phase, despite paediatric NUH guidance allowing selected fruits?.'),
('Honeydew', 'cannot', 'Adult SKH/NUH guidance excludes fruits; paediatric NUH guidance permits selected ripe/cooked fruits, showing protocol/population differences.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence B; evidence conflict; human review pending] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Governance question: Should the adult prototype exclude all fruit during the low-residue phase, despite paediatric NUH guidance allowing selected fruits?.'),
-- Drinks / clear liquids
('Water', 'can', 'Water and specified clear/light-coloured drinks are directly permitted during clear-liquid phases, subject to hospital timing and colour rules.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet [evidence B] Conditions: Only while clear fluids are permitted; stop at the hospital-specific fasting cut-off. Ambiguity: Only while fluids are still permitted under the hospital fasting cut-off.'),
('Clear chicken broth', 'can', 'Water and specified clear/light-coloured drinks are directly permitted during clear-liquid phases, subject to hospital timing and colour rules.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet [evidence B] Conditions: Only while clear fluids are permitted; stop at the hospital-specific fasting cut-off. Ambiguity: Only while fluids are still permitted under the hospital fasting cut-off.'),
('Clear fish broth', 'can', 'Water and specified clear/light-coloured drinks are directly permitted during clear-liquid phases, subject to hospital timing and colour rules.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet [evidence B] Conditions: Only while clear fluids are permitted; stop at the hospital-specific fasting cut-off. Ambiguity: Only while fluids are still permitted under the hospital fasting cut-off.'),
('Colourless soft drink', 'can', 'Water and specified clear/light-coloured drinks are directly permitted during clear-liquid phases, subject to hospital timing and colour rules.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet [evidence B] Conditions: Only while clear fluids are permitted; stop at the hospital-specific fasting cut-off. Ambiguity: Only while fluids are still permitted under the hospital fasting cut-off.'),
('Glucose drink', 'can', 'Water and specified clear/light-coloured drinks are directly permitted during clear-liquid phases, subject to hospital timing and colour rules.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet [evidence B] Conditions: Only while clear fluids are permitted; stop at the hospital-specific fasting cut-off. Ambiguity: Only while fluids are still permitted under the hospital fasting cut-off.'),
('Honey water', 'can', 'Water and specified clear/light-coloured drinks are directly permitted during clear-liquid phases, subject to hospital timing and colour rules.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet [evidence B] Conditions: Only while clear fluids are permitted; stop at the hospital-specific fasting cut-off. Ambiguity: Only while fluids are still permitted under the hospital fasting cut-off.'),
-- Drinks / juice
('Apple juice (clear, no pulp)', 'review', 'SKH permits light-coloured apple/pear juice; NUH adult booklet broadly says fruit juices to avoid before clear-liquid phase but clear-liquid lists vary; paediatric NUH permits clear apple juice.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence F; evidence conflict; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Governance question: Which pulp-free fruit juices are permitted during the clear-liquid phase, and what colours are acceptable?.'),
('Pear juice (clear, no pulp)', 'review', 'SKH permits light-coloured apple/pear juice; NUH adult booklet broadly says fruit juices to avoid before clear-liquid phase but clear-liquid lists vary; paediatric NUH permits clear apple juice.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet; NUH paediatric diet [evidence F; evidence conflict; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Governance question: Which pulp-free fruit juices are permitted during the clear-liquid phase, and what colours are acceptable?.'),
('Orange juice', 'cannot', 'Fresh fruit/vegetable juices and juices with pulp are excluded by adult NUH guidance; clear-liquid guidance requires clear fluids.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — NUH bowel-prep guidance; NUH colonoscopy booklet [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Ambiguity: Commercial filtered versions may differ; clear-liquid acceptability is protocol-specific.'),
('Sugarcane juice', 'cannot', 'Fresh fruit/vegetable juices and juices with pulp are excluded by adult NUH guidance; clear-liquid guidance requires clear fluids.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — NUH bowel-prep guidance; NUH colonoscopy booklet [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Ambiguity: Commercial filtered versions may differ; clear-liquid acceptability is protocol-specific.'),
('Calamansi drink', 'cannot', 'Fresh fruit/vegetable juices and juices with pulp are excluded by adult NUH guidance; clear-liquid guidance requires clear fluids.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — NUH bowel-prep guidance; NUH colonoscopy booklet [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Ambiguity: Commercial filtered versions may differ; clear-liquid acceptability is protocol-specific.'),
('Coconut water', 'cannot', 'Fresh fruit/vegetable juices and juices with pulp are excluded by adult NUH guidance; clear-liquid guidance requires clear fluids.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — NUH bowel-prep guidance; NUH colonoscopy booklet [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Ambiguity: Commercial filtered versions may differ; clear-liquid acceptability is protocol-specific.'),
('Grape juice', 'cannot', 'SKH excludes dark/red liquids such as grape, prune and tomato juice; colour restrictions also appear in NUH paediatric clear-fluid guidance.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH paediatric diet [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise.'),
('Prune juice', 'cannot', 'SKH excludes dark/red liquids such as grape, prune and tomato juice; colour restrictions also appear in NUH paediatric clear-fluid guidance.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH paediatric diet [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise.'),
('Tomato juice', 'cannot', 'SKH excludes dark/red liquids such as grape, prune and tomato juice; colour restrictions also appear in NUH paediatric clear-fluid guidance.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH paediatric diet [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise.'),
-- Drinks / malted
('Milo', 'review', 'SKH excludes Milo/Horlicks during low-residue guidance; CGH allows Milo without milk at breakfast the day before, showing protocol differences.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; CGH Preparing for Colonoscopy [evidence F; evidence conflict; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Governance question: Are Milo/Horlicks permitted during the low-residue phase or day-before light breakfast under the target protocol?.'),
('Horlicks', 'review', 'SKH excludes Milo/Horlicks during low-residue guidance; CGH allows Milo without milk at breakfast the day before, showing protocol differences.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; CGH Preparing for Colonoscopy [evidence F; evidence conflict; human review pending] Conditions: Check the exact hospital protocol; do not infer permission from fibre content alone. Governance question: Are Milo/Horlicks permitted during the low-residue phase or day-before light breakfast under the target protocol?.'),
-- Drinks / clear liquids
('Isotonic drink (light-coloured)', 'can', 'Water and specified clear/light-coloured drinks are directly permitted during clear-liquid phases, subject to hospital timing and colour rules.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH colonoscopy booklet [evidence B] Conditions: Only while clear fluids are permitted; stop at the hospital-specific fasting cut-off. Ambiguity: Colour restrictions vary; avoid red/blue/purple where instructed.'),
('Isotonic drink (red/purple/blue)', 'cannot', 'SKH excludes dark/red liquids such as grape, prune and tomato juice; colour restrictions also appear in NUH paediatric clear-fluid guidance.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — SKH Diet Advice; NUH paediatric diet [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise.'),
-- Drinks
('Chin chow drink', 'cannot', 'NUH adult guidance explicitly lists jelly and agar-agar among foods to avoid; paediatric NUH also avoids gelatine desserts during clear fluids.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — NUH colonoscopy booklet; NUH bowel cleansing; NUH paediatric diet [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise. Ambiguity: Contains grass jelly solids unless fully removed; not a clear liquid.'),
-- Dessert
('Jelly', 'cannot', 'NUH adult guidance explicitly lists jelly and agar-agar among foods to avoid; paediatric NUH also avoids gelatine desserts during clear fluids.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — NUH colonoscopy booklet; NUH bowel cleansing; NUH paediatric diet [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise.'),
('Agar-agar', 'cannot', 'NUH adult guidance explicitly lists jelly and agar-agar among foods to avoid; paediatric NUH also avoids gelatine desserts during clear fluids.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) — NUH colonoscopy booklet; NUH bowel cleansing; NUH paediatric diet [evidence B] Conditions: Avoid during the stated phase unless your hospital explicitly instructs otherwise.');

-- === Ingredients: dataset guard ====================================
-- Not from either sheet. Carries the "we cannot itemise this" ruling for the
-- dishes in note 3 above, so their verdict stays 'review' instead of 'can'.

INSERT INTO ingredient_tab (name, classification, classification_reason, source_hospital, source_document) VALUES
('Unlisted extras (recipe varies)', 'review', 'The sheet rules on this dish as a whole but does not list what goes into it, so the extras cannot be checked one by one. Ask for the plain version.', 'DIETICIAN', 'UAT dataset (hackathon, requires clinical validation) -- seed-time guard, not a sheet row');

-- === Dishes: every row of dish_tab.csv ==============================
-- Ingredient ids are looked up on the tier that ingredient was seeded on, so a
-- TTSH dish can legitimately reference DIETICIAN ingredients.
-- Inline comments: <dish_tab.csv ID> | sheet ruling -> verdict food.py will derive.

INSERT INTO dishes_tab (name, meal_type, source_hospital, ingredient_list) VALUES

-- --- SINGLE-INGREDIENT ENTRIES (dish_tab.csv Type = Ingredient) ---
('White rice', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'TTSH'), 'name', 'White rice'))),
('White porridge', ARRAY['breakfast']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White porridge' AND source_hospital = 'TTSH'), 'name', 'White porridge'))),
('Bee hoon', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Bee hoon' AND source_hospital = 'TTSH'), 'name', 'Bee hoon'))),
('Kway teow', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Kway teow' AND source_hospital = 'TTSH'), 'name', 'Kway teow'))),
('Mee sua', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Mee sua' AND source_hospital = 'TTSH'), 'name', 'Mee sua'))),
('White bread', ARRAY['breakfast']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White bread' AND source_hospital = 'TTSH'), 'name', 'White bread'))),
('Plain crackers', ARRAY['breakfast', 'snack']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain crackers' AND source_hospital = 'TTSH'), 'name', 'Plain crackers'))),
('Plain biscuits', ARRAY['breakfast', 'snack']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain biscuits' AND source_hospital = 'TTSH'), 'name', 'Plain biscuits'))),
('Rice cereal', ARRAY['breakfast', 'snack']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Rice cereal' AND source_hospital = 'TTSH'), 'name', 'Rice cereal'))),
('Yellow noodles', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Yellow noodles' AND source_hospital = 'TTSH'), 'name', 'Yellow noodles'))),
('Mee pok', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Mee pok' AND source_hospital = 'TTSH'), 'name', 'Mee pok'))),
('Mee kia', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Mee kia' AND source_hospital = 'TTSH'), 'name', 'Mee kia'))),
('Pasta', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Pasta' AND source_hospital = 'TTSH'), 'name', 'Pasta'))),
('Brown rice', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Brown rice' AND source_hospital = 'TTSH'), 'name', 'Brown rice'))),
('Brown rice porridge', ARRAY['breakfast']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Brown rice porridge' AND source_hospital = 'TTSH'), 'name', 'Brown rice porridge'))),
('Wholemeal bread', ARRAY['breakfast']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Wholemeal bread' AND source_hospital = 'TTSH'), 'name', 'Wholemeal bread'))),
('Wholegrain bread', ARRAY['breakfast']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Wholegrain bread' AND source_hospital = 'TTSH'), 'name', 'Wholegrain bread'))),
('Chapati', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chapati' AND source_hospital = 'TTSH'), 'name', 'Chapati'))),
('Oats', ARRAY['breakfast', 'snack']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Oats' AND source_hospital = 'TTSH'), 'name', 'Oats'))),
('Barley', ARRAY['breakfast', 'snack']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Barley' AND source_hospital = 'TTSH'), 'name', 'Barley'))),
('Muesli', ARRAY['breakfast', 'snack']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Muesli' AND source_hospital = 'TTSH'), 'name', 'Muesli'))),
('Popcorn', ARRAY['breakfast', 'snack']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Popcorn' AND source_hospital = 'TTSH'), 'name', 'Popcorn'))),
('Bran cereal', ARRAY['breakfast', 'snack']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Bran cereal' AND source_hospital = 'TTSH'), 'name', 'Bran cereal'))),
('Potato', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Potato' AND source_hospital = 'DIETICIAN'), 'name', 'Potato'))),
('Sweet potato', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Sweet potato' AND source_hospital = 'DIETICIAN'), 'name', 'Sweet potato'))),
('Yam / taro', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Yam / taro' AND source_hospital = 'DIETICIAN'), 'name', 'Yam / taro'))),
('Plain prata', ARRAY['breakfast']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain prata' AND source_hospital = 'TTSH'), 'name', 'Plain prata'))),
('Plain naan', ARRAY['breakfast']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain naan' AND source_hospital = 'TTSH'), 'name', 'Plain naan'))),
('Plain pancake', ARRAY['breakfast']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain pancake' AND source_hospital = 'TTSH'), 'name', 'Plain pancake'))),
('Plain waffle', ARRAY['breakfast']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain waffle' AND source_hospital = 'TTSH'), 'name', 'Plain waffle'))),
('Chicken', ARRAY['lunch', 'dinner']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chicken' AND source_hospital = 'TTSH'), 'name', 'Chicken'))),
('Fish', ARRAY['lunch', 'dinner']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fish' AND source_hospital = 'TTSH'), 'name', 'Fish'))),
('Prawns', ARRAY['lunch', 'dinner']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Prawns' AND source_hospital = 'TTSH'), 'name', 'Prawns'))),
('Squid', ARRAY['lunch', 'dinner']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Squid' AND source_hospital = 'TTSH'), 'name', 'Squid'))),
('Egg', ARRAY['lunch', 'dinner']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Egg' AND source_hospital = 'TTSH'), 'name', 'Egg'))),
('Shellfish', ARRAY['lunch', 'dinner']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Shellfish' AND source_hospital = 'TTSH'), 'name', 'Shellfish'))),
('Pork', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Pork' AND source_hospital = 'DIETICIAN'), 'name', 'Pork'))),
('Beef', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Beef' AND source_hospital = 'DIETICIAN'), 'name', 'Beef'))),
('Mutton / lamb', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Mutton / lamb' AND source_hospital = 'DIETICIAN'), 'name', 'Mutton / lamb'))),
('Duck', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Duck' AND source_hospital = 'DIETICIAN'), 'name', 'Duck'))),
('Fishball', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fishball' AND source_hospital = 'DIETICIAN'), 'name', 'Fishball'))),
('Fishcake', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fishcake' AND source_hospital = 'DIETICIAN'), 'name', 'Fishcake'))),
('Sausage', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Sausage' AND source_hospital = 'DIETICIAN'), 'name', 'Sausage'))),
('Luncheon meat', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Luncheon meat' AND source_hospital = 'DIETICIAN'), 'name', 'Luncheon meat'))),
('Vegetarian mock meat', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Vegetarian mock meat' AND source_hospital = 'DIETICIAN'), 'name', 'Vegetarian mock meat'))),
('Tofu', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Tofu' AND source_hospital = 'DIETICIAN'), 'name', 'Tofu'))),
('Taukwa', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Taukwa' AND source_hospital = 'DIETICIAN'), 'name', 'Taukwa'))),
('Tau pok', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Tau pok' AND source_hospital = 'DIETICIAN'), 'name', 'Tau pok'))),
('Tempeh', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Tempeh' AND source_hospital = 'DIETICIAN'), 'name', 'Tempeh'))),
('Soybeans', ARRAY['lunch', 'dinner', 'snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Soybeans' AND source_hospital = 'DIETICIAN'), 'name', 'Soybeans'))),
('Red beans', ARRAY['lunch', 'dinner', 'snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Red beans' AND source_hospital = 'DIETICIAN'), 'name', 'Red beans'))),
('Mung beans', ARRAY['lunch', 'dinner', 'snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Mung beans' AND source_hospital = 'DIETICIAN'), 'name', 'Mung beans'))),
('Chickpeas', ARRAY['lunch', 'dinner', 'snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chickpeas' AND source_hospital = 'DIETICIAN'), 'name', 'Chickpeas'))),
('Lentils', ARRAY['lunch', 'dinner', 'snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lentils' AND source_hospital = 'DIETICIAN'), 'name', 'Lentils'))),
('Peas', ARRAY['lunch', 'dinner', 'snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Peas' AND source_hospital = 'DIETICIAN'), 'name', 'Peas'))),
('Peanuts', ARRAY['lunch', 'dinner', 'snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Peanuts' AND source_hospital = 'DIETICIAN'), 'name', 'Peanuts'))),
('Sesame seeds', ARRAY['lunch', 'dinner', 'snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Sesame seeds' AND source_hospital = 'DIETICIAN'), 'name', 'Sesame seeds'))),
('Chia seeds', ARRAY['lunch', 'dinner', 'snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chia seeds' AND source_hospital = 'DIETICIAN'), 'name', 'Chia seeds'))),
('Flax seeds', ARRAY['lunch', 'dinner', 'snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Flax seeds' AND source_hospital = 'DIETICIAN'), 'name', 'Flax seeds'))),
('Sunflower seeds', ARRAY['lunch', 'dinner', 'snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Sunflower seeds' AND source_hospital = 'DIETICIAN'), 'name', 'Sunflower seeds'))),
('Pumpkin seeds', ARRAY['lunch', 'dinner', 'snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Pumpkin seeds' AND source_hospital = 'DIETICIAN'), 'name', 'Pumpkin seeds'))),
('Mixed nuts', ARRAY['lunch', 'dinner', 'snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Mixed nuts' AND source_hospital = 'DIETICIAN'), 'name', 'Mixed nuts'))),
('Smooth peanut butter', ARRAY['lunch', 'dinner', 'snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Smooth peanut butter' AND source_hospital = 'DIETICIAN'), 'name', 'Smooth peanut butter'))),
('Cucumber', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Cucumber' AND source_hospital = 'DIETICIAN'), 'name', 'Cucumber'))),
('Tomato', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Tomato' AND source_hospital = 'DIETICIAN'), 'name', 'Tomato'))),
('Carrot', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Carrot' AND source_hospital = 'DIETICIAN'), 'name', 'Carrot'))),
('Pumpkin', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Pumpkin' AND source_hospital = 'DIETICIAN'), 'name', 'Pumpkin'))),
('Cabbage', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Cabbage' AND source_hospital = 'DIETICIAN'), 'name', 'Cabbage'))),
('Chye sim', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chye sim' AND source_hospital = 'DIETICIAN'), 'name', 'Chye sim'))),
('Kai lan', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Kai lan' AND source_hospital = 'DIETICIAN'), 'name', 'Kai lan'))),
('Kang kong', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Kang kong' AND source_hospital = 'DIETICIAN'), 'name', 'Kang kong'))),
('Spinach', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Spinach' AND source_hospital = 'DIETICIAN'), 'name', 'Spinach'))),
('Lettuce', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lettuce' AND source_hospital = 'DIETICIAN'), 'name', 'Lettuce'))),
('Bean sprouts', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Bean sprouts' AND source_hospital = 'DIETICIAN'), 'name', 'Bean sprouts'))),
('Broccoli', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Broccoli' AND source_hospital = 'DIETICIAN'), 'name', 'Broccoli'))),
('Cauliflower', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Cauliflower' AND source_hospital = 'DIETICIAN'), 'name', 'Cauliflower'))),
('French beans', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'French beans' AND source_hospital = 'DIETICIAN'), 'name', 'French beans'))),
('Okra', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Okra' AND source_hospital = 'DIETICIAN'), 'name', 'Okra'))),
('Eggplant', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Eggplant' AND source_hospital = 'DIETICIAN'), 'name', 'Eggplant'))),
('Bitter gourd', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Bitter gourd' AND source_hospital = 'DIETICIAN'), 'name', 'Bitter gourd'))),
('Mushrooms', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Mushrooms' AND source_hospital = 'DIETICIAN'), 'name', 'Mushrooms'))),
('Seaweed', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Seaweed' AND source_hospital = 'DIETICIAN'), 'name', 'Seaweed'))),
('Onion', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Onion' AND source_hospital = 'DIETICIAN'), 'name', 'Onion'))),
('Garlic', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Garlic' AND source_hospital = 'DIETICIAN'), 'name', 'Garlic'))),
('Ginger', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Ginger' AND source_hospital = 'DIETICIAN'), 'name', 'Ginger'))),
('Chilli', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chilli' AND source_hospital = 'DIETICIAN'), 'name', 'Chilli'))),
('Spring onion', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Spring onion' AND source_hospital = 'DIETICIAN'), 'name', 'Spring onion'))),
('Coriander', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Coriander' AND source_hospital = 'DIETICIAN'), 'name', 'Coriander'))),
('Laksa leaves', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Laksa leaves' AND source_hospital = 'DIETICIAN'), 'name', 'Laksa leaves'))),
('Lemongrass', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lemongrass' AND source_hospital = 'DIETICIAN'), 'name', 'Lemongrass'))),
('Fried shallots', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fried shallots' AND source_hospital = 'DIETICIAN'), 'name', 'Fried shallots'))),
('Corn', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Corn' AND source_hospital = 'DIETICIAN'), 'name', 'Corn'))),
('Cooking oil', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Cooking oil' AND source_hospital = 'TTSH'), 'name', 'Cooking oil'))),
('Butter', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Butter' AND source_hospital = 'TTSH'), 'name', 'Butter'))),
('Mayonnaise', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Mayonnaise' AND source_hospital = 'TTSH'), 'name', 'Mayonnaise'))),
('Soy sauce', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Soy sauce' AND source_hospital = 'DIETICIAN'), 'name', 'Soy sauce'))),
('Dark soy sauce', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Dark soy sauce' AND source_hospital = 'DIETICIAN'), 'name', 'Dark soy sauce'))),
('Oyster sauce', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Oyster sauce' AND source_hospital = 'DIETICIAN'), 'name', 'Oyster sauce'))),
('Tomato ketchup', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Tomato ketchup' AND source_hospital = 'DIETICIAN'), 'name', 'Tomato ketchup'))),
('Sweet chilli sauce', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Sweet chilli sauce' AND source_hospital = 'DIETICIAN'), 'name', 'Sweet chilli sauce'))),
('Sambal', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Sambal' AND source_hospital = 'DIETICIAN'), 'name', 'Sambal'))),
('Curry paste', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Curry paste' AND source_hospital = 'DIETICIAN'), 'name', 'Curry paste'))),
('Laksa paste', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Laksa paste' AND source_hospital = 'DIETICIAN'), 'name', 'Laksa paste'))),
('Coconut milk', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Coconut milk' AND source_hospital = 'TTSH'), 'name', 'Coconut milk'))),
('Coconut flesh', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Coconut flesh' AND source_hospital = 'TTSH'), 'name', 'Coconut flesh'))),
('Kaya', ARRAY['breakfast', 'lunch', 'dinner']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Kaya' AND source_hospital = 'TTSH'), 'name', 'Kaya'))),
('Fresh milk', ARRAY['breakfast', 'drink']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fresh milk' AND source_hospital = 'TTSH'), 'name', 'Fresh milk'))),
('Yoghurt', ARRAY['breakfast', 'drink']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Yoghurt' AND source_hospital = 'TTSH'), 'name', 'Yoghurt'))),
('Cheese', ARRAY['breakfast', 'drink']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Cheese' AND source_hospital = 'TTSH'), 'name', 'Cheese'))),
('Condensed milk', ARRAY['breakfast', 'drink']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Condensed milk' AND source_hospital = 'TTSH'), 'name', 'Condensed milk'))),
('Evaporated milk', ARRAY['breakfast', 'drink']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Evaporated milk' AND source_hospital = 'TTSH'), 'name', 'Evaporated milk'))),
('Cream', ARRAY['breakfast', 'drink']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Cream' AND source_hospital = 'TTSH'), 'name', 'Cream'))),
('Soy milk', ARRAY['drink']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Soy milk' AND source_hospital = 'TTSH'), 'name', 'Soy milk'))),
('Banana', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Banana' AND source_hospital = 'DIETICIAN'), 'name', 'Banana'))),
('Papaya', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Papaya' AND source_hospital = 'DIETICIAN'), 'name', 'Papaya'))),
('Watermelon', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Watermelon' AND source_hospital = 'DIETICIAN'), 'name', 'Watermelon'))),
('Apple', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Apple' AND source_hospital = 'DIETICIAN'), 'name', 'Apple'))),
('Orange', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Orange' AND source_hospital = 'DIETICIAN'), 'name', 'Orange'))),
('Pineapple', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Pineapple' AND source_hospital = 'DIETICIAN'), 'name', 'Pineapple'))),
('Mango', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Mango' AND source_hospital = 'DIETICIAN'), 'name', 'Mango'))),
('Guava', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Guava' AND source_hospital = 'DIETICIAN'), 'name', 'Guava'))),
('Pear', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Pear' AND source_hospital = 'DIETICIAN'), 'name', 'Pear'))),
('Grapes', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Grapes' AND source_hospital = 'DIETICIAN'), 'name', 'Grapes'))),
('Berries', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Berries' AND source_hospital = 'DIETICIAN'), 'name', 'Berries'))),
('Dried fruit', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Dried fruit' AND source_hospital = 'DIETICIAN'), 'name', 'Dried fruit'))),
('Raisins', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Raisins' AND source_hospital = 'DIETICIAN'), 'name', 'Raisins'))),
('Prunes', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Prunes' AND source_hospital = 'DIETICIAN'), 'name', 'Prunes'))),
('Honeydew', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Honeydew' AND source_hospital = 'DIETICIAN'), 'name', 'Honeydew'))),
('Water', ARRAY['drink']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Water' AND source_hospital = 'DIETICIAN'), 'name', 'Water'))),
('Clear chicken broth', ARRAY['drink']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Clear chicken broth' AND source_hospital = 'DIETICIAN'), 'name', 'Clear chicken broth'))),
('Clear fish broth', ARRAY['drink']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Clear fish broth' AND source_hospital = 'DIETICIAN'), 'name', 'Clear fish broth'))),
('Colourless soft drink', ARRAY['drink']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Colourless soft drink' AND source_hospital = 'DIETICIAN'), 'name', 'Colourless soft drink'))),
('Glucose drink', ARRAY['drink']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Glucose drink' AND source_hospital = 'DIETICIAN'), 'name', 'Glucose drink'))),
('Honey water', ARRAY['drink']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Honey water' AND source_hospital = 'DIETICIAN'), 'name', 'Honey water'))),
('Apple juice (clear, no pulp)', ARRAY['drink']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Apple juice (clear, no pulp)' AND source_hospital = 'DIETICIAN'), 'name', 'Apple juice (clear, no pulp)'))),
('Pear juice (clear, no pulp)', ARRAY['drink']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Pear juice (clear, no pulp)' AND source_hospital = 'DIETICIAN'), 'name', 'Pear juice (clear, no pulp)'))),
('Orange juice', ARRAY['drink']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Orange juice' AND source_hospital = 'DIETICIAN'), 'name', 'Orange juice'))),
('Sugarcane juice', ARRAY['drink']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Sugarcane juice' AND source_hospital = 'DIETICIAN'), 'name', 'Sugarcane juice'))),
('Calamansi drink', ARRAY['drink']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Calamansi drink' AND source_hospital = 'DIETICIAN'), 'name', 'Calamansi drink'))),
('Coconut water', ARRAY['drink']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Coconut water' AND source_hospital = 'DIETICIAN'), 'name', 'Coconut water'))),
('Grape juice', ARRAY['drink']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Grape juice' AND source_hospital = 'DIETICIAN'), 'name', 'Grape juice'))),
('Prune juice', ARRAY['drink']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Prune juice' AND source_hospital = 'DIETICIAN'), 'name', 'Prune juice'))),
('Tomato juice', ARRAY['drink']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Tomato juice' AND source_hospital = 'DIETICIAN'), 'name', 'Tomato juice'))),
('Kopi-O', ARRAY['drink']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Kopi-O' AND source_hospital = 'TTSH'), 'name', 'Kopi-O'))),
('Teh-O', ARRAY['drink']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Teh-O' AND source_hospital = 'TTSH'), 'name', 'Teh-O'))),
('Black coffee', ARRAY['drink']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Black coffee' AND source_hospital = 'TTSH'), 'name', 'Black coffee'))),
('Plain tea', ARRAY['drink']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain tea' AND source_hospital = 'TTSH'), 'name', 'Plain tea'))),
('Kopi', ARRAY['drink']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Kopi' AND source_hospital = 'TTSH'), 'name', 'Kopi'))),
('Teh', ARRAY['drink']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Teh' AND source_hospital = 'TTSH'), 'name', 'Teh'))),
('Kopi-C', ARRAY['drink']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Kopi-C' AND source_hospital = 'TTSH'), 'name', 'Kopi-C'))),
('Teh-C', ARRAY['drink']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Teh-C' AND source_hospital = 'TTSH'), 'name', 'Teh-C'))),
('Teh tarik', ARRAY['drink']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Teh tarik' AND source_hospital = 'TTSH'), 'name', 'Teh tarik'))),
('Milo', ARRAY['drink']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Milo' AND source_hospital = 'DIETICIAN'), 'name', 'Milo'))),
('Horlicks', ARRAY['drink']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Horlicks' AND source_hospital = 'DIETICIAN'), 'name', 'Horlicks'))),
('Barley water', ARRAY['drink']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Barley water' AND source_hospital = 'TTSH'), 'name', 'Barley water'))),
('Isotonic drink (light-coloured)', ARRAY['drink']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Isotonic drink (light-coloured)' AND source_hospital = 'DIETICIAN'), 'name', 'Isotonic drink (light-coloured)'))),
('Isotonic drink (red/purple/blue)', ARRAY['drink']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Isotonic drink (red/purple/blue)' AND source_hospital = 'DIETICIAN'), 'name', 'Isotonic drink (red/purple/blue)'))),
('Bandung', ARRAY['drink']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Bandung' AND source_hospital = 'TTSH'), 'name', 'Bandung'))),
('Soy bean drink', ARRAY['drink']::dish_meal_type[], 'TTSH',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Soy bean drink' AND source_hospital = 'TTSH'), 'name', 'Soy bean drink'))),
('Chin chow drink', ARRAY['drink']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chin chow drink' AND source_hospital = 'DIETICIAN'), 'name', 'Chin chow drink'))),
('Jelly', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Jelly' AND source_hospital = 'DIETICIAN'), 'name', 'Jelly'))),
('Agar-agar', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Agar-agar' AND source_hospital = 'DIETICIAN'), 'name', 'Agar-agar'))),

-- --- CHINESE / HAWKER ---
-- DSH-001 | sheet: MODIFY -> derived: cannot
('Chicken rice', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'TTSH'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chicken' AND source_hospital = 'TTSH'), 'name', 'Chicken'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Cucumber' AND source_hospital = 'DIETICIAN'), 'name', 'Cucumber'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chilli' AND source_hospital = 'DIETICIAN'), 'name', 'Chilli'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Soy sauce' AND source_hospital = 'DIETICIAN'), 'name', 'Soy sauce'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fried shallots' AND source_hospital = 'DIETICIAN'), 'name', 'Fried shallots')
  )),
-- DSH-002 | sheet: MODIFY -> derived: cannot
('Roasted chicken rice', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'TTSH'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chicken' AND source_hospital = 'TTSH'), 'name', 'Chicken'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Cucumber' AND source_hospital = 'DIETICIAN'), 'name', 'Cucumber'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Soy sauce' AND source_hospital = 'DIETICIAN'), 'name', 'Soy sauce'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chilli' AND source_hospital = 'DIETICIAN'), 'name', 'Chilli'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fried shallots' AND source_hospital = 'DIETICIAN'), 'name', 'Fried shallots')
  )),
-- DSH-003 | sheet: MODIFY -> derived: cannot
('Steamed chicken rice', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'TTSH'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chicken' AND source_hospital = 'TTSH'), 'name', 'Chicken'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Cucumber' AND source_hospital = 'DIETICIAN'), 'name', 'Cucumber'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Soy sauce' AND source_hospital = 'DIETICIAN'), 'name', 'Soy sauce'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chilli' AND source_hospital = 'DIETICIAN'), 'name', 'Chilli'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fried shallots' AND source_hospital = 'DIETICIAN'), 'name', 'Fried shallots')
  )),
-- DSH-004 | sheet: CANNOT -> derived: cannot
('Roast duck rice', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'TTSH'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Duck' AND source_hospital = 'DIETICIAN'), 'name', 'Duck'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Cucumber' AND source_hospital = 'DIETICIAN'), 'name', 'Cucumber'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Dark soy sauce' AND source_hospital = 'DIETICIAN'), 'name', 'Dark soy sauce')
  )),
-- DSH-005 | sheet: REVIEW -> derived: possible
('Char siu rice', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'TTSH'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Pork' AND source_hospital = 'DIETICIAN'), 'name', 'Pork'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Cucumber' AND source_hospital = 'DIETICIAN'), 'name', 'Cucumber')
  )),
-- DSH-006 | sheet: MODIFY -> derived: review
('Economic rice / cai png', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'TTSH'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Unlisted extras (recipe varies)' AND source_hospital = 'DIETICIAN'), 'name', 'Unlisted extras (recipe varies)')
  )),
-- DSH-007 | sheet: MODIFY -> derived: cannot
('Fried rice', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'TTSH'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Egg' AND source_hospital = 'TTSH'), 'name', 'Egg'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Peas' AND source_hospital = 'DIETICIAN'), 'name', 'Peas'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Spring onion' AND source_hospital = 'DIETICIAN'), 'name', 'Spring onion')
  )),
-- DSH-008 | sheet: MODIFY -> derived: cannot
('Char kway teow', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Kway teow' AND source_hospital = 'TTSH'), 'name', 'Kway teow'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Egg' AND source_hospital = 'TTSH'), 'name', 'Egg'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Prawns' AND source_hospital = 'TTSH'), 'name', 'Prawns'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fishcake' AND source_hospital = 'DIETICIAN'), 'name', 'Fishcake'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Bean sprouts' AND source_hospital = 'DIETICIAN'), 'name', 'Bean sprouts'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Spring onion' AND source_hospital = 'DIETICIAN'), 'name', 'Spring onion'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Dark soy sauce' AND source_hospital = 'DIETICIAN'), 'name', 'Dark soy sauce'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chilli' AND source_hospital = 'DIETICIAN'), 'name', 'Chilli')
  )),
-- DSH-009 | sheet: MODIFY -> derived: possible
('Hokkien mee', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Yellow noodles' AND source_hospital = 'TTSH'), 'name', 'Yellow noodles'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Bee hoon' AND source_hospital = 'TTSH'), 'name', 'Bee hoon'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Prawns' AND source_hospital = 'TTSH'), 'name', 'Prawns'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Squid' AND source_hospital = 'TTSH'), 'name', 'Squid'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Pork' AND source_hospital = 'DIETICIAN'), 'name', 'Pork'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Bean sprouts' AND source_hospital = 'DIETICIAN'), 'name', 'Bean sprouts'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Spring onion' AND source_hospital = 'DIETICIAN'), 'name', 'Spring onion'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Sambal' AND source_hospital = 'DIETICIAN'), 'name', 'Sambal')
  )),
-- DSH-010 | sheet: MODIFY -> derived: cannot
('Prawn mee', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Yellow noodles' AND source_hospital = 'TTSH'), 'name', 'Yellow noodles'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Bee hoon' AND source_hospital = 'TTSH'), 'name', 'Bee hoon'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Prawns' AND source_hospital = 'TTSH'), 'name', 'Prawns'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Pork' AND source_hospital = 'DIETICIAN'), 'name', 'Pork'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Bean sprouts' AND source_hospital = 'DIETICIAN'), 'name', 'Bean sprouts'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Kang kong' AND source_hospital = 'DIETICIAN'), 'name', 'Kang kong'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chilli' AND source_hospital = 'DIETICIAN'), 'name', 'Chilli'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fried shallots' AND source_hospital = 'DIETICIAN'), 'name', 'Fried shallots')
  )),
-- DSH-011 | sheet: REVIEW -> derived: cannot
('Fishball noodles', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Mee pok' AND source_hospital = 'TTSH'), 'name', 'Mee pok'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Mee kia' AND source_hospital = 'TTSH'), 'name', 'Mee kia'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fishball' AND source_hospital = 'DIETICIAN'), 'name', 'Fishball'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fishcake' AND source_hospital = 'DIETICIAN'), 'name', 'Fishcake'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lettuce' AND source_hospital = 'DIETICIAN'), 'name', 'Lettuce'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Bean sprouts' AND source_hospital = 'DIETICIAN'), 'name', 'Bean sprouts'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chilli' AND source_hospital = 'DIETICIAN'), 'name', 'Chilli'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Spring onion' AND source_hospital = 'DIETICIAN'), 'name', 'Spring onion')
  )),
-- DSH-012 | sheet: MODIFY -> derived: cannot
('Bak chor mee', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Mee pok' AND source_hospital = 'TTSH'), 'name', 'Mee pok'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Mee kia' AND source_hospital = 'TTSH'), 'name', 'Mee kia'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Pork' AND source_hospital = 'DIETICIAN'), 'name', 'Pork'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fishball' AND source_hospital = 'DIETICIAN'), 'name', 'Fishball'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Mushrooms' AND source_hospital = 'DIETICIAN'), 'name', 'Mushrooms'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lettuce' AND source_hospital = 'DIETICIAN'), 'name', 'Lettuce'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chilli' AND source_hospital = 'DIETICIAN'), 'name', 'Chilli'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Spring onion' AND source_hospital = 'DIETICIAN'), 'name', 'Spring onion'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fried shallots' AND source_hospital = 'DIETICIAN'), 'name', 'Fried shallots')
  )),
-- DSH-013 | sheet: MODIFY -> derived: cannot
('Wanton noodles', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Yellow noodles' AND source_hospital = 'TTSH'), 'name', 'Yellow noodles'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Pork' AND source_hospital = 'DIETICIAN'), 'name', 'Pork'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chye sim' AND source_hospital = 'DIETICIAN'), 'name', 'Chye sim'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chilli' AND source_hospital = 'DIETICIAN'), 'name', 'Chilli'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Spring onion' AND source_hospital = 'DIETICIAN'), 'name', 'Spring onion')
  )),
-- DSH-014 | sheet: REVIEW -> derived: cannot
('Lor mee', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Yellow noodles' AND source_hospital = 'TTSH'), 'name', 'Yellow noodles'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Egg' AND source_hospital = 'TTSH'), 'name', 'Egg'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fishcake' AND source_hospital = 'DIETICIAN'), 'name', 'Fishcake'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Pork' AND source_hospital = 'DIETICIAN'), 'name', 'Pork'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Bean sprouts' AND source_hospital = 'DIETICIAN'), 'name', 'Bean sprouts'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chilli' AND source_hospital = 'DIETICIAN'), 'name', 'Chilli'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Coriander' AND source_hospital = 'DIETICIAN'), 'name', 'Coriander'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Garlic' AND source_hospital = 'DIETICIAN'), 'name', 'Garlic')
  )),
-- DSH-015 | sheet: CANNOT -> derived: cannot
('Beef hor fun', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Kway teow' AND source_hospital = 'TTSH'), 'name', 'Kway teow'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Beef' AND source_hospital = 'DIETICIAN'), 'name', 'Beef'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Kai lan' AND source_hospital = 'DIETICIAN'), 'name', 'Kai lan'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chye sim' AND source_hospital = 'DIETICIAN'), 'name', 'Chye sim'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Spring onion' AND source_hospital = 'DIETICIAN'), 'name', 'Spring onion')
  )),
-- DSH-016 | sheet: MODIFY -> derived: cannot
('Sliced fish bee hoon', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Bee hoon' AND source_hospital = 'TTSH'), 'name', 'Bee hoon'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fish' AND source_hospital = 'TTSH'), 'name', 'Fish'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Tomato' AND source_hospital = 'DIETICIAN'), 'name', 'Tomato'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fresh milk' AND source_hospital = 'TTSH'), 'name', 'Fresh milk'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fried shallots' AND source_hospital = 'DIETICIAN'), 'name', 'Fried shallots')
  )),
-- DSH-017 | sheet: MODIFY -> derived: cannot
('Fish soup', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'TTSH'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fish' AND source_hospital = 'TTSH'), 'name', 'Fish'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Tomato' AND source_hospital = 'DIETICIAN'), 'name', 'Tomato'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Clear chicken broth' AND source_hospital = 'DIETICIAN'), 'name', 'Clear chicken broth'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fried shallots' AND source_hospital = 'DIETICIAN'), 'name', 'Fried shallots'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Spring onion' AND source_hospital = 'DIETICIAN'), 'name', 'Spring onion')
  )),
-- DSH-018 | sheet: MODIFY -> derived: review
('Chicken soup', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'TTSH'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chicken' AND source_hospital = 'TTSH'), 'name', 'Chicken'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Clear chicken broth' AND source_hospital = 'DIETICIAN'), 'name', 'Clear chicken broth'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Unlisted extras (recipe varies)' AND source_hospital = 'DIETICIAN'), 'name', 'Unlisted extras (recipe varies)')
  )),
-- DSH-019 | sheet: MODIFY -> derived: cannot
('Congee', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White porridge' AND source_hospital = 'TTSH'), 'name', 'White porridge'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Spring onion' AND source_hospital = 'DIETICIAN'), 'name', 'Spring onion'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Ginger' AND source_hospital = 'DIETICIAN'), 'name', 'Ginger'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Soy sauce' AND source_hospital = 'DIETICIAN'), 'name', 'Soy sauce'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fried shallots' AND source_hospital = 'DIETICIAN'), 'name', 'Fried shallots')
  )),
-- DSH-020 | sheet: MODIFY -> derived: cannot
('Fish porridge', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White porridge' AND source_hospital = 'TTSH'), 'name', 'White porridge'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fish' AND source_hospital = 'TTSH'), 'name', 'Fish'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Spring onion' AND source_hospital = 'DIETICIAN'), 'name', 'Spring onion'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Ginger' AND source_hospital = 'DIETICIAN'), 'name', 'Ginger'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Soy sauce' AND source_hospital = 'DIETICIAN'), 'name', 'Soy sauce'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fried shallots' AND source_hospital = 'DIETICIAN'), 'name', 'Fried shallots')
  )),
-- DSH-021 | sheet: MODIFY -> derived: cannot
('Chicken porridge', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White porridge' AND source_hospital = 'TTSH'), 'name', 'White porridge'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chicken' AND source_hospital = 'TTSH'), 'name', 'Chicken'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Spring onion' AND source_hospital = 'DIETICIAN'), 'name', 'Spring onion'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Ginger' AND source_hospital = 'DIETICIAN'), 'name', 'Ginger'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Soy sauce' AND source_hospital = 'DIETICIAN'), 'name', 'Soy sauce'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fried shallots' AND source_hospital = 'DIETICIAN'), 'name', 'Fried shallots')
  )),
-- DSH-022 | sheet: REVIEW -> derived: cannot
('Century egg porridge', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White porridge' AND source_hospital = 'TTSH'), 'name', 'White porridge'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Egg' AND source_hospital = 'TTSH'), 'name', 'Egg'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Pork' AND source_hospital = 'DIETICIAN'), 'name', 'Pork'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Spring onion' AND source_hospital = 'DIETICIAN'), 'name', 'Spring onion'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Ginger' AND source_hospital = 'DIETICIAN'), 'name', 'Ginger'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Soy sauce' AND source_hospital = 'DIETICIAN'), 'name', 'Soy sauce'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fried shallots' AND source_hospital = 'DIETICIAN'), 'name', 'Fried shallots')
  )),
-- DSH-023 | sheet: REVIEW -> derived: cannot
('Claypot rice', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'TTSH'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chicken' AND source_hospital = 'TTSH'), 'name', 'Chicken'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Sausage' AND source_hospital = 'DIETICIAN'), 'name', 'Sausage'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Mushrooms' AND source_hospital = 'DIETICIAN'), 'name', 'Mushrooms'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chye sim' AND source_hospital = 'DIETICIAN'), 'name', 'Chye sim'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Dark soy sauce' AND source_hospital = 'DIETICIAN'), 'name', 'Dark soy sauce'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Spring onion' AND source_hospital = 'DIETICIAN'), 'name', 'Spring onion')
  )),
-- DSH-024 | sheet: MODIFY -> derived: cannot
('Bak kut teh', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'TTSH'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Pork' AND source_hospital = 'DIETICIAN'), 'name', 'Pork'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Garlic' AND source_hospital = 'DIETICIAN'), 'name', 'Garlic'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Coriander' AND source_hospital = 'DIETICIAN'), 'name', 'Coriander')
  )),
-- DSH-025 | sheet: REVIEW -> derived: possible
('Pig organ soup', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'TTSH'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Pork' AND source_hospital = 'DIETICIAN'), 'name', 'Pork'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Spring onion' AND source_hospital = 'DIETICIAN'), 'name', 'Spring onion')
  )),
-- DSH-026 | sheet: MODIFY -> derived: cannot
('Steamed fish', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'TTSH'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fish' AND source_hospital = 'TTSH'), 'name', 'Fish'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Ginger' AND source_hospital = 'DIETICIAN'), 'name', 'Ginger'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Spring onion' AND source_hospital = 'DIETICIAN'), 'name', 'Spring onion'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Soy sauce' AND source_hospital = 'DIETICIAN'), 'name', 'Soy sauce'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Coriander' AND source_hospital = 'DIETICIAN'), 'name', 'Coriander')
  )),
-- DSH-027 | sheet: MODIFY -> derived: cannot
('Sweet and sour fish', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'TTSH'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fish' AND source_hospital = 'TTSH'), 'name', 'Fish'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Onion' AND source_hospital = 'DIETICIAN'), 'name', 'Onion'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Pineapple' AND source_hospital = 'DIETICIAN'), 'name', 'Pineapple')
  )),
-- DSH-028 | sheet: CANNOT -> derived: cannot
('Black pepper beef', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'TTSH'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Beef' AND source_hospital = 'DIETICIAN'), 'name', 'Beef'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Onion' AND source_hospital = 'DIETICIAN'), 'name', 'Onion')
  )),
-- DSH-029 | sheet: CANNOT -> derived: cannot
('Beef noodles', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Yellow noodles' AND source_hospital = 'TTSH'), 'name', 'Yellow noodles'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Beef' AND source_hospital = 'DIETICIAN'), 'name', 'Beef'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Spring onion' AND source_hospital = 'DIETICIAN'), 'name', 'Spring onion')
  )),
-- DSH-030 | sheet: REVIEW -> derived: possible
('Kway chap', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Kway teow' AND source_hospital = 'TTSH'), 'name', 'Kway teow'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Pork' AND source_hospital = 'DIETICIAN'), 'name', 'Pork'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Dark soy sauce' AND source_hospital = 'DIETICIAN'), 'name', 'Dark soy sauce'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fried shallots' AND source_hospital = 'DIETICIAN'), 'name', 'Fried shallots')
  )),
-- DSH-031 | sheet: MODIFY -> derived: possible
('Roast meats platter', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'TTSH'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Pork' AND source_hospital = 'DIETICIAN'), 'name', 'Pork'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Duck' AND source_hospital = 'DIETICIAN'), 'name', 'Duck'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chicken' AND source_hospital = 'TTSH'), 'name', 'Chicken'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Cucumber' AND source_hospital = 'DIETICIAN'), 'name', 'Cucumber')
  )),
-- DSH-032 | sheet: REVIEW -> derived: review
('Har gow', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Prawns' AND source_hospital = 'TTSH'), 'name', 'Prawns'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Unlisted extras (recipe varies)' AND source_hospital = 'DIETICIAN'), 'name', 'Unlisted extras (recipe varies)')
  )),
-- DSH-033 | sheet: REVIEW -> derived: review
('Siew mai', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Pork' AND source_hospital = 'DIETICIAN'), 'name', 'Pork'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Prawns' AND source_hospital = 'TTSH'), 'name', 'Prawns'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Unlisted extras (recipe varies)' AND source_hospital = 'DIETICIAN'), 'name', 'Unlisted extras (recipe varies)')
  )),
-- DSH-034 | sheet: MODIFY -> derived: cannot
('Chee cheong fun', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Soy sauce' AND source_hospital = 'DIETICIAN'), 'name', 'Soy sauce'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Sesame seeds' AND source_hospital = 'DIETICIAN'), 'name', 'Sesame seeds'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fried shallots' AND source_hospital = 'DIETICIAN'), 'name', 'Fried shallots')
  )),
-- DSH-035 | sheet: REVIEW -> derived: cannot
('Chai tow kway / carrot cake', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Egg' AND source_hospital = 'TTSH'), 'name', 'Egg'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Spring onion' AND source_hospital = 'DIETICIAN'), 'name', 'Spring onion'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Dark soy sauce' AND source_hospital = 'DIETICIAN'), 'name', 'Dark soy sauce'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Soy sauce' AND source_hospital = 'DIETICIAN'), 'name', 'Soy sauce'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chilli' AND source_hospital = 'DIETICIAN'), 'name', 'Chilli')
  )),
-- DSH-036 | sheet: CANNOT -> derived: cannot
('Popiah', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Egg' AND source_hospital = 'TTSH'), 'name', 'Egg'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Prawns' AND source_hospital = 'TTSH'), 'name', 'Prawns'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lettuce' AND source_hospital = 'DIETICIAN'), 'name', 'Lettuce'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Bean sprouts' AND source_hospital = 'DIETICIAN'), 'name', 'Bean sprouts'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Peanuts' AND source_hospital = 'DIETICIAN'), 'name', 'Peanuts'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chilli' AND source_hospital = 'DIETICIAN'), 'name', 'Chilli'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fried shallots' AND source_hospital = 'DIETICIAN'), 'name', 'Fried shallots')
  )),
-- DSH-037 | sheet: CANNOT -> derived: cannot
('Rojak', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Tofu' AND source_hospital = 'DIETICIAN'), 'name', 'Tofu'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Cooking oil' AND source_hospital = 'TTSH'), 'name', 'Cooking oil'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Cucumber' AND source_hospital = 'DIETICIAN'), 'name', 'Cucumber'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Pineapple' AND source_hospital = 'DIETICIAN'), 'name', 'Pineapple'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Peanuts' AND source_hospital = 'DIETICIAN'), 'name', 'Peanuts')
  )),
-- DSH-038 | sheet: REVIEW -> derived: cannot
('Satay', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chicken' AND source_hospital = 'TTSH'), 'name', 'Chicken'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Pork' AND source_hospital = 'DIETICIAN'), 'name', 'Pork'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Beef' AND source_hospital = 'DIETICIAN'), 'name', 'Beef'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Mutton / lamb' AND source_hospital = 'DIETICIAN'), 'name', 'Mutton / lamb'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Cucumber' AND source_hospital = 'DIETICIAN'), 'name', 'Cucumber'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Onion' AND source_hospital = 'DIETICIAN'), 'name', 'Onion'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Peanuts' AND source_hospital = 'DIETICIAN'), 'name', 'Peanuts')
  )),
-- DSH-039 | sheet: MODIFY -> derived: cannot
('Chilli crab', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Shellfish' AND source_hospital = 'TTSH'), 'name', 'Shellfish'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chilli' AND source_hospital = 'DIETICIAN'), 'name', 'Chilli'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Tomato' AND source_hospital = 'DIETICIAN'), 'name', 'Tomato'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Tomato ketchup' AND source_hospital = 'DIETICIAN'), 'name', 'Tomato ketchup')
  )),
-- DSH-040 | sheet: MODIFY -> derived: cannot
('Cereal prawns', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Cooking oil' AND source_hospital = 'TTSH'), 'name', 'Cooking oil'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Prawns' AND source_hospital = 'TTSH'), 'name', 'Prawns'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chilli' AND source_hospital = 'DIETICIAN'), 'name', 'Chilli'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Butter' AND source_hospital = 'TTSH'), 'name', 'Butter')
  )),
-- DSH-041 | sheet: REVIEW -> derived: possible
('Ngoh hiang', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Pork' AND source_hospital = 'DIETICIAN'), 'name', 'Pork'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Prawns' AND source_hospital = 'TTSH'), 'name', 'Prawns'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Onion' AND source_hospital = 'DIETICIAN'), 'name', 'Onion')
  )),

-- --- MALAY ---
-- DSH-042 | sheet: REVIEW -> derived: possible
('Nasi lemak', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'TTSH'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Coconut milk' AND source_hospital = 'TTSH'), 'name', 'Coconut milk'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Egg' AND source_hospital = 'TTSH'), 'name', 'Egg'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chicken' AND source_hospital = 'TTSH'), 'name', 'Chicken'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fish' AND source_hospital = 'TTSH'), 'name', 'Fish'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Cucumber' AND source_hospital = 'DIETICIAN'), 'name', 'Cucumber'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Peanuts' AND source_hospital = 'DIETICIAN'), 'name', 'Peanuts'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Sambal' AND source_hospital = 'DIETICIAN'), 'name', 'Sambal')
  )),
-- DSH-043 | sheet: MODIFY -> derived: cannot
('Nasi padang', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'TTSH'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Curry paste' AND source_hospital = 'DIETICIAN'), 'name', 'Curry paste'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Sambal' AND source_hospital = 'DIETICIAN'), 'name', 'Sambal')
  )),
-- DSH-044 | sheet: REVIEW -> derived: cannot
('Mee rebus', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Yellow noodles' AND source_hospital = 'TTSH'), 'name', 'Yellow noodles'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Egg' AND source_hospital = 'TTSH'), 'name', 'Egg'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Bean sprouts' AND source_hospital = 'DIETICIAN'), 'name', 'Bean sprouts'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chye sim' AND source_hospital = 'DIETICIAN'), 'name', 'Chye sim'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Sweet potato' AND source_hospital = 'DIETICIAN'), 'name', 'Sweet potato'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chilli' AND source_hospital = 'DIETICIAN'), 'name', 'Chilli'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fried shallots' AND source_hospital = 'DIETICIAN'), 'name', 'Fried shallots'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Spring onion' AND source_hospital = 'DIETICIAN'), 'name', 'Spring onion')
  )),
-- DSH-045 | sheet: REVIEW -> derived: cannot
('Mee siam', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Bee hoon' AND source_hospital = 'TTSH'), 'name', 'Bee hoon'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Egg' AND source_hospital = 'TTSH'), 'name', 'Egg'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Prawns' AND source_hospital = 'TTSH'), 'name', 'Prawns'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Bean sprouts' AND source_hospital = 'DIETICIAN'), 'name', 'Bean sprouts'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Spring onion' AND source_hospital = 'DIETICIAN'), 'name', 'Spring onion'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Curry paste' AND source_hospital = 'DIETICIAN'), 'name', 'Curry paste')
  )),
-- DSH-046 | sheet: MODIFY -> derived: cannot
('Malay mee goreng', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Yellow noodles' AND source_hospital = 'TTSH'), 'name', 'Yellow noodles'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Egg' AND source_hospital = 'TTSH'), 'name', 'Egg'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chicken' AND source_hospital = 'TTSH'), 'name', 'Chicken'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Cabbage' AND source_hospital = 'DIETICIAN'), 'name', 'Cabbage'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Tomato' AND source_hospital = 'DIETICIAN'), 'name', 'Tomato'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Sweet chilli sauce' AND source_hospital = 'DIETICIAN'), 'name', 'Sweet chilli sauce'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Spring onion' AND source_hospital = 'DIETICIAN'), 'name', 'Spring onion')
  )),
-- DSH-047 | sheet: MODIFY -> derived: cannot
('Ayam penyet', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'TTSH'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chicken' AND source_hospital = 'TTSH'), 'name', 'Chicken'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Cooking oil' AND source_hospital = 'TTSH'), 'name', 'Cooking oil'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Cucumber' AND source_hospital = 'DIETICIAN'), 'name', 'Cucumber'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Cabbage' AND source_hospital = 'DIETICIAN'), 'name', 'Cabbage'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Sambal' AND source_hospital = 'DIETICIAN'), 'name', 'Sambal')
  )),
-- DSH-048 | sheet: MODIFY -> derived: cannot
('Ayam bakar', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'TTSH'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chicken' AND source_hospital = 'TTSH'), 'name', 'Chicken'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Cucumber' AND source_hospital = 'DIETICIAN'), 'name', 'Cucumber'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lettuce' AND source_hospital = 'DIETICIAN'), 'name', 'Lettuce'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Sambal' AND source_hospital = 'DIETICIAN'), 'name', 'Sambal')
  )),
-- DSH-049 | sheet: MODIFY -> derived: cannot
('Mee soto', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Yellow noodles' AND source_hospital = 'TTSH'), 'name', 'Yellow noodles'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chicken' AND source_hospital = 'TTSH'), 'name', 'Chicken'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Bean sprouts' AND source_hospital = 'DIETICIAN'), 'name', 'Bean sprouts'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chilli' AND source_hospital = 'DIETICIAN'), 'name', 'Chilli'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Spring onion' AND source_hospital = 'DIETICIAN'), 'name', 'Spring onion'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fried shallots' AND source_hospital = 'DIETICIAN'), 'name', 'Fried shallots')
  )),
-- DSH-050 | sheet: MODIFY -> derived: cannot
('Soto ayam', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Yellow noodles' AND source_hospital = 'TTSH'), 'name', 'Yellow noodles'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chicken' AND source_hospital = 'TTSH'), 'name', 'Chicken'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Bean sprouts' AND source_hospital = 'DIETICIAN'), 'name', 'Bean sprouts'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Cabbage' AND source_hospital = 'DIETICIAN'), 'name', 'Cabbage'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chilli' AND source_hospital = 'DIETICIAN'), 'name', 'Chilli'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fried shallots' AND source_hospital = 'DIETICIAN'), 'name', 'Fried shallots')
  )),
-- DSH-051 | sheet: REVIEW -> derived: cannot
('Lontong', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Egg' AND source_hospital = 'TTSH'), 'name', 'Egg'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Cabbage' AND source_hospital = 'DIETICIAN'), 'name', 'Cabbage'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'French beans' AND source_hospital = 'DIETICIAN'), 'name', 'French beans'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Coconut milk' AND source_hospital = 'TTSH'), 'name', 'Coconut milk'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Sambal' AND source_hospital = 'DIETICIAN'), 'name', 'Sambal')
  )),
-- DSH-052 | sheet: CANNOT -> derived: cannot
('Sup tulang', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White bread' AND source_hospital = 'TTSH'), 'name', 'White bread'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'TTSH'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Mutton / lamb' AND source_hospital = 'DIETICIAN'), 'name', 'Mutton / lamb'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Onion' AND source_hospital = 'DIETICIAN'), 'name', 'Onion'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Tomato' AND source_hospital = 'DIETICIAN'), 'name', 'Tomato'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Curry paste' AND source_hospital = 'DIETICIAN'), 'name', 'Curry paste')
  )),
-- DSH-053 | sheet: CANNOT -> derived: cannot
('Beef rendang', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'TTSH'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Beef' AND source_hospital = 'DIETICIAN'), 'name', 'Beef'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Coconut milk' AND source_hospital = 'TTSH'), 'name', 'Coconut milk'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Curry paste' AND source_hospital = 'DIETICIAN'), 'name', 'Curry paste')
  )),
-- DSH-054 | sheet: REVIEW -> derived: possible
('Chicken rendang', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'TTSH'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chicken' AND source_hospital = 'TTSH'), 'name', 'Chicken'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Coconut milk' AND source_hospital = 'TTSH'), 'name', 'Coconut milk'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Curry paste' AND source_hospital = 'DIETICIAN'), 'name', 'Curry paste')
  )),
-- DSH-055 | sheet: MODIFY -> derived: cannot
('Assam fish', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'TTSH'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fish' AND source_hospital = 'TTSH'), 'name', 'Fish'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Okra' AND source_hospital = 'DIETICIAN'), 'name', 'Okra'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Tomato' AND source_hospital = 'DIETICIAN'), 'name', 'Tomato'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chilli' AND source_hospital = 'DIETICIAN'), 'name', 'Chilli')
  )),
-- DSH-056 | sheet: REVIEW -> derived: cannot
('Otah', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fish' AND source_hospital = 'TTSH'), 'name', 'Fish'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chilli' AND source_hospital = 'DIETICIAN'), 'name', 'Chilli'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Coconut milk' AND source_hospital = 'TTSH'), 'name', 'Coconut milk'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Curry paste' AND source_hospital = 'DIETICIAN'), 'name', 'Curry paste')
  )),
-- DSH-057 | sheet: REVIEW -> derived: possible
('Begedil', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Potato' AND source_hospital = 'DIETICIAN'), 'name', 'Potato'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Egg' AND source_hospital = 'TTSH'), 'name', 'Egg'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Pork' AND source_hospital = 'DIETICIAN'), 'name', 'Pork'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Onion' AND source_hospital = 'DIETICIAN'), 'name', 'Onion')
  )),

-- --- INDIAN ---
-- DSH-058 | sheet: REVIEW -> derived: cannot
('Egg prata', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain prata' AND source_hospital = 'TTSH'), 'name', 'Plain prata'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Egg' AND source_hospital = 'TTSH'), 'name', 'Egg'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Curry paste' AND source_hospital = 'DIETICIAN'), 'name', 'Curry paste')
  )),
-- DSH-059 | sheet: MODIFY -> derived: cannot
('Onion prata', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain prata' AND source_hospital = 'TTSH'), 'name', 'Plain prata'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Onion' AND source_hospital = 'DIETICIAN'), 'name', 'Onion'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Curry paste' AND source_hospital = 'DIETICIAN'), 'name', 'Curry paste')
  )),
-- DSH-060 | sheet: REVIEW -> derived: cannot
('Cheese prata', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Plain prata' AND source_hospital = 'TTSH'), 'name', 'Plain prata'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Cheese' AND source_hospital = 'TTSH'), 'name', 'Cheese'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Curry paste' AND source_hospital = 'DIETICIAN'), 'name', 'Curry paste')
  )),
-- DSH-061 | sheet: REVIEW -> derived: cannot
('Thosai / dosa', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lentils' AND source_hospital = 'DIETICIAN'), 'name', 'Lentils'))),
-- DSH-062 | sheet: CAN -> derived: cannot
('Idli', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lentils' AND source_hospital = 'DIETICIAN'), 'name', 'Lentils'))),
-- DSH-063 | sheet: CAN -> derived: review
('Idiyappam / putu mayam', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Bee hoon' AND source_hospital = 'TTSH'), 'name', 'Bee hoon'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Coconut milk' AND source_hospital = 'TTSH'), 'name', 'Coconut milk'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Coconut flesh' AND source_hospital = 'TTSH'), 'name', 'Coconut flesh')
  )),
-- DSH-064 | sheet: REVIEW -> derived: review
('Appam', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Coconut milk' AND source_hospital = 'TTSH'), 'name', 'Coconut milk'))),
-- DSH-065 | sheet: REVIEW -> derived: review
('Naan', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White bread' AND source_hospital = 'TTSH'), 'name', 'White bread'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Butter' AND source_hospital = 'TTSH'), 'name', 'Butter')
  )),
-- DSH-066 | sheet: REVIEW -> derived: review
('Tandoori chicken', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chicken' AND source_hospital = 'TTSH'), 'name', 'Chicken'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Yoghurt' AND source_hospital = 'TTSH'), 'name', 'Yoghurt')
  )),
-- DSH-067 | sheet: REVIEW -> derived: cannot
('Biryani', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'TTSH'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chicken' AND source_hospital = 'TTSH'), 'name', 'Chicken'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Mutton / lamb' AND source_hospital = 'DIETICIAN'), 'name', 'Mutton / lamb'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Onion' AND source_hospital = 'DIETICIAN'), 'name', 'Onion'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Yoghurt' AND source_hospital = 'TTSH'), 'name', 'Yoghurt'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Cooking oil' AND source_hospital = 'TTSH'), 'name', 'Cooking oil')
  )),
-- DSH-068 | sheet: REVIEW -> derived: cannot
('Murtabak', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Mutton / lamb' AND source_hospital = 'DIETICIAN'), 'name', 'Mutton / lamb'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chicken' AND source_hospital = 'TTSH'), 'name', 'Chicken'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Onion' AND source_hospital = 'DIETICIAN'), 'name', 'Onion'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Curry paste' AND source_hospital = 'DIETICIAN'), 'name', 'Curry paste')
  )),
-- DSH-069 | sheet: MODIFY -> derived: cannot
('Indian mee goreng', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Yellow noodles' AND source_hospital = 'TTSH'), 'name', 'Yellow noodles'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Egg' AND source_hospital = 'TTSH'), 'name', 'Egg'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Pork' AND source_hospital = 'DIETICIAN'), 'name', 'Pork'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Cabbage' AND source_hospital = 'DIETICIAN'), 'name', 'Cabbage'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Tomato' AND source_hospital = 'DIETICIAN'), 'name', 'Tomato'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chilli' AND source_hospital = 'DIETICIAN'), 'name', 'Chilli'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Tomato ketchup' AND source_hospital = 'DIETICIAN'), 'name', 'Tomato ketchup'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Spring onion' AND source_hospital = 'DIETICIAN'), 'name', 'Spring onion')
  )),
-- DSH-070 | sheet: MODIFY -> derived: cannot
('Fish curry', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'TTSH'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fish' AND source_hospital = 'TTSH'), 'name', 'Fish'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Okra' AND source_hospital = 'DIETICIAN'), 'name', 'Okra'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Tomato' AND source_hospital = 'DIETICIAN'), 'name', 'Tomato'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Onion' AND source_hospital = 'DIETICIAN'), 'name', 'Onion'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Curry paste' AND source_hospital = 'DIETICIAN'), 'name', 'Curry paste')
  )),
-- DSH-071 | sheet: MODIFY -> derived: cannot
('Chicken curry', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'TTSH'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chicken' AND source_hospital = 'TTSH'), 'name', 'Chicken'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Potato' AND source_hospital = 'DIETICIAN'), 'name', 'Potato'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Onion' AND source_hospital = 'DIETICIAN'), 'name', 'Onion'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Curry paste' AND source_hospital = 'DIETICIAN'), 'name', 'Curry paste')
  )),
-- DSH-072 | sheet: MODIFY -> derived: cannot
('Fish head curry', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'TTSH'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fish' AND source_hospital = 'TTSH'), 'name', 'Fish'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Okra' AND source_hospital = 'DIETICIAN'), 'name', 'Okra'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Eggplant' AND source_hospital = 'DIETICIAN'), 'name', 'Eggplant'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Tomato' AND source_hospital = 'DIETICIAN'), 'name', 'Tomato'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Curry paste' AND source_hospital = 'DIETICIAN'), 'name', 'Curry paste')
  )),
-- DSH-073 | sheet: CANNOT -> derived: cannot
('Dhal', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lentils' AND source_hospital = 'DIETICIAN'), 'name', 'Lentils'))),
-- DSH-074 | sheet: CANNOT -> derived: cannot
('Samosa', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Potato' AND source_hospital = 'DIETICIAN'), 'name', 'Potato'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Peas' AND source_hospital = 'DIETICIAN'), 'name', 'Peas')
  )),
-- DSH-075 | sheet: CANNOT -> derived: cannot
('Vadai', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lentils' AND source_hospital = 'DIETICIAN'), 'name', 'Lentils'))),

-- --- PERANAKAN / LOCAL / DRINKS & DESSERTS ---
-- DSH-076 | sheet: REVIEW -> derived: cannot
('Laksa', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Bee hoon' AND source_hospital = 'TTSH'), 'name', 'Bee hoon'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Prawns' AND source_hospital = 'TTSH'), 'name', 'Prawns'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fishcake' AND source_hospital = 'DIETICIAN'), 'name', 'Fishcake'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Egg' AND source_hospital = 'TTSH'), 'name', 'Egg'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Bean sprouts' AND source_hospital = 'DIETICIAN'), 'name', 'Bean sprouts'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Cucumber' AND source_hospital = 'DIETICIAN'), 'name', 'Cucumber'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Coconut milk' AND source_hospital = 'TTSH'), 'name', 'Coconut milk'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Laksa paste' AND source_hospital = 'DIETICIAN'), 'name', 'Laksa paste'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chilli' AND source_hospital = 'DIETICIAN'), 'name', 'Chilli'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Laksa leaves' AND source_hospital = 'DIETICIAN'), 'name', 'Laksa leaves')
  )),
-- DSH-077 | sheet: CANNOT -> derived: cannot
('Chicken buah keluak', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'TTSH'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chicken' AND source_hospital = 'TTSH'), 'name', 'Chicken'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Mixed nuts' AND source_hospital = 'DIETICIAN'), 'name', 'Mixed nuts'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Curry paste' AND source_hospital = 'DIETICIAN'), 'name', 'Curry paste')
  )),
-- DSH-078 | sheet: CANNOT -> derived: review
('Chap chye', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'TTSH'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Tofu' AND source_hospital = 'DIETICIAN'), 'name', 'Tofu'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Dark soy sauce' AND source_hospital = 'DIETICIAN'), 'name', 'Dark soy sauce')
  )),
-- DSH-079 | sheet: REVIEW -> derived: possible
('Ayam pongteh', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'TTSH'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chicken' AND source_hospital = 'TTSH'), 'name', 'Chicken'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Potato' AND source_hospital = 'DIETICIAN'), 'name', 'Potato'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Soybeans' AND source_hospital = 'DIETICIAN'), 'name', 'Soybeans')
  )),
-- DSH-080 | sheet: MODIFY -> derived: review
('Kaya toast', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White bread' AND source_hospital = 'TTSH'), 'name', 'White bread'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Kaya' AND source_hospital = 'TTSH'), 'name', 'Kaya'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Butter' AND source_hospital = 'TTSH'), 'name', 'Butter')
  )),
-- DSH-081 | sheet: CANNOT -> derived: cannot
('Ice kacang', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Peanuts' AND source_hospital = 'DIETICIAN'), 'name', 'Peanuts'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Jelly' AND source_hospital = 'DIETICIAN'), 'name', 'Jelly'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Corn' AND source_hospital = 'DIETICIAN'), 'name', 'Corn')
  )),
-- DSH-082 | sheet: CANNOT -> derived: cannot
('Chendol', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Red beans' AND source_hospital = 'DIETICIAN'), 'name', 'Red beans'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Coconut milk' AND source_hospital = 'TTSH'), 'name', 'Coconut milk'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Jelly' AND source_hospital = 'DIETICIAN'), 'name', 'Jelly')
  )),
-- DSH-083 | sheet: CANNOT -> derived: cannot
('Bubur cha cha', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Sweet potato' AND source_hospital = 'DIETICIAN'), 'name', 'Sweet potato'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Yam / taro' AND source_hospital = 'DIETICIAN'), 'name', 'Yam / taro'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Coconut milk' AND source_hospital = 'TTSH'), 'name', 'Coconut milk')
  )),
-- DSH-084 | sheet: CANNOT -> derived: cannot
('Red bean soup', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Red beans' AND source_hospital = 'DIETICIAN'), 'name', 'Red beans'))),
-- DSH-085 | sheet: CANNOT -> derived: cannot
('Green bean soup', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Mung beans' AND source_hospital = 'DIETICIAN'), 'name', 'Mung beans'))),
-- DSH-086 | sheet: CANNOT -> derived: cannot
('Peanut soup', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Peanuts' AND source_hospital = 'DIETICIAN'), 'name', 'Peanuts'))),
-- DSH-087 | sheet: REVIEW -> derived: review
('Tau huay', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Tofu' AND source_hospital = 'DIETICIAN'), 'name', 'Tofu'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Unlisted extras (recipe varies)' AND source_hospital = 'DIETICIAN'), 'name', 'Unlisted extras (recipe varies)')
  )),
-- DSH-088 | sheet: CANNOT -> derived: cannot
('Mango pudding', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Mango' AND source_hospital = 'DIETICIAN'), 'name', 'Mango'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fresh milk' AND source_hospital = 'TTSH'), 'name', 'Fresh milk'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Cream' AND source_hospital = 'TTSH'), 'name', 'Cream')
  )),
-- DSH-089 | sheet: CANNOT -> derived: review
('Onde-onde', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Coconut flesh' AND source_hospital = 'TTSH'), 'name', 'Coconut flesh'))),
-- DSH-090 | sheet: CANNOT -> derived: cannot
('Ang ku kueh', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Mung beans' AND source_hospital = 'DIETICIAN'), 'name', 'Mung beans'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Peanuts' AND source_hospital = 'DIETICIAN'), 'name', 'Peanuts'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Cooking oil' AND source_hospital = 'TTSH'), 'name', 'Cooking oil')
  )),
-- DSH-091 | sheet: REVIEW -> derived: review
('Steamed rice kueh (plain)', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Unlisted extras (recipe varies)' AND source_hospital = 'DIETICIAN'), 'name', 'Unlisted extras (recipe varies)'))),
-- DSH-093 | sheet: CAN -> derived: can
('Clear broth', ARRAY['drink', 'lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Clear chicken broth' AND source_hospital = 'DIETICIAN'), 'name', 'Clear chicken broth'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Clear fish broth' AND source_hospital = 'DIETICIAN'), 'name', 'Clear fish broth')
  )),
-- DSH-101 | sheet: REVIEW -> derived: review
('Milo drink', ARRAY['drink']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Milo' AND source_hospital = 'DIETICIAN'), 'name', 'Milo'))),
-- DSH-102 | sheet: REVIEW -> derived: review
('Horlicks drink', ARRAY['drink']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Horlicks' AND source_hospital = 'DIETICIAN'), 'name', 'Horlicks'))),
-- DSH-104 | sheet: REVIEW -> derived: review
('Apple juice', ARRAY['drink']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Apple juice (clear, no pulp)' AND source_hospital = 'DIETICIAN'), 'name', 'Apple juice (clear, no pulp)'))),
-- DSH-105 | sheet: REVIEW -> derived: review
('Pear juice', ARRAY['drink']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Pear juice (clear, no pulp)' AND source_hospital = 'DIETICIAN'), 'name', 'Pear juice (clear, no pulp)'))),
-- DSH-115 | sheet: CANNOT -> derived: cannot
('Chin chow', ARRAY['drink']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chin chow drink' AND source_hospital = 'DIETICIAN'), 'name', 'Chin chow drink'))),
-- DSH-116 | sheet: CAN -> derived: can
('Isotonic drink (light colour)', ARRAY['drink']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Isotonic drink (light-coloured)' AND source_hospital = 'DIETICIAN'), 'name', 'Isotonic drink (light-coloured)'))),
-- DSH-117 | sheet: CAN -> derived: can
('Soft drink (colourless)', ARRAY['drink']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Colourless soft drink' AND source_hospital = 'DIETICIAN'), 'name', 'Colourless soft drink'))),
-- DSH-118 | sheet: CANNOT -> derived: cannot
('Jelly dessert', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Jelly' AND source_hospital = 'DIETICIAN'), 'name', 'Jelly'))),
-- DSH-119 | sheet: CANNOT -> derived: cannot
('Agar-agar dessert', ARRAY['snack']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Agar-agar' AND source_hospital = 'DIETICIAN'), 'name', 'Agar-agar'))),

-- --- LOCAL BREAKFAST ---
-- DSH-120 | sheet: CAN -> derived: can
('Plain toast', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White bread' AND source_hospital = 'TTSH'), 'name', 'White bread'))),
-- DSH-121 | sheet: CAN -> derived: review
('Soft-boiled eggs', ARRAY['breakfast']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Egg' AND source_hospital = 'TTSH'), 'name', 'Egg'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Soy sauce' AND source_hospital = 'DIETICIAN'), 'name', 'Soy sauce')
  )),

-- --- CHINESE ---
-- DSH-122 | sheet: MODIFY -> derived: possible
('Mee sua soup', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Mee sua' AND source_hospital = 'TTSH'), 'name', 'Mee sua'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chicken' AND source_hospital = 'TTSH'), 'name', 'Chicken'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fish' AND source_hospital = 'TTSH'), 'name', 'Fish'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Egg' AND source_hospital = 'TTSH'), 'name', 'Egg'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Clear chicken broth' AND source_hospital = 'DIETICIAN'), 'name', 'Clear chicken broth'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Spring onion' AND source_hospital = 'DIETICIAN'), 'name', 'Spring onion')
  )),
-- DSH-123 | sheet: REVIEW -> derived: cannot
('Kway teow soup', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Kway teow' AND source_hospital = 'TTSH'), 'name', 'Kway teow'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fishball' AND source_hospital = 'DIETICIAN'), 'name', 'Fishball'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fishcake' AND source_hospital = 'DIETICIAN'), 'name', 'Fishcake'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Bean sprouts' AND source_hospital = 'DIETICIAN'), 'name', 'Bean sprouts'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lettuce' AND source_hospital = 'DIETICIAN'), 'name', 'Lettuce'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Clear chicken broth' AND source_hospital = 'DIETICIAN'), 'name', 'Clear chicken broth'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Spring onion' AND source_hospital = 'DIETICIAN'), 'name', 'Spring onion')
  )),
-- DSH-124 | sheet: MODIFY -> derived: possible
('Bee hoon soup', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Bee hoon' AND source_hospital = 'TTSH'), 'name', 'Bee hoon'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chicken' AND source_hospital = 'TTSH'), 'name', 'Chicken'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fish' AND source_hospital = 'TTSH'), 'name', 'Fish'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Clear chicken broth' AND source_hospital = 'DIETICIAN'), 'name', 'Clear chicken broth'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Spring onion' AND source_hospital = 'DIETICIAN'), 'name', 'Spring onion')
  )),
-- DSH-125 | sheet: REVIEW -> derived: possible
('Yong tau foo soup', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Yellow noodles' AND source_hospital = 'TTSH'), 'name', 'Yellow noodles'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Tofu' AND source_hospital = 'DIETICIAN'), 'name', 'Tofu'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fishcake' AND source_hospital = 'DIETICIAN'), 'name', 'Fishcake'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Clear chicken broth' AND source_hospital = 'DIETICIAN'), 'name', 'Clear chicken broth'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Spring onion' AND source_hospital = 'DIETICIAN'), 'name', 'Spring onion')
  )),
-- DSH-126 | sheet: REVIEW -> derived: possible
('Yong tau foo dry', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Yellow noodles' AND source_hospital = 'TTSH'), 'name', 'Yellow noodles'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Tofu' AND source_hospital = 'DIETICIAN'), 'name', 'Tofu'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fishcake' AND source_hospital = 'DIETICIAN'), 'name', 'Fishcake'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Sweet chilli sauce' AND source_hospital = 'DIETICIAN'), 'name', 'Sweet chilli sauce')
  )),
-- DSH-127 | sheet: REVIEW -> derived: possible
('Wonton soup', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Pork' AND source_hospital = 'DIETICIAN'), 'name', 'Pork'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Prawns' AND source_hospital = 'TTSH'), 'name', 'Prawns'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Clear chicken broth' AND source_hospital = 'DIETICIAN'), 'name', 'Clear chicken broth'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Spring onion' AND source_hospital = 'DIETICIAN'), 'name', 'Spring onion')
  )),
-- DSH-128 | sheet: CAN -> derived: review
('Plain steamed egg', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Egg' AND source_hospital = 'TTSH'), 'name', 'Egg'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Soy sauce' AND source_hospital = 'DIETICIAN'), 'name', 'Soy sauce')
  )),

-- --- GENERAL ---
-- DSH-129 | sheet: MODIFY -> derived: cannot
('Omelette', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Egg' AND source_hospital = 'TTSH'), 'name', 'Egg'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Onion' AND source_hospital = 'DIETICIAN'), 'name', 'Onion'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Cooking oil' AND source_hospital = 'TTSH'), 'name', 'Cooking oil')
  )),
-- DSH-130 | sheet: REVIEW -> derived: review
('Fried chicken', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chicken' AND source_hospital = 'TTSH'), 'name', 'Chicken'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Cooking oil' AND source_hospital = 'TTSH'), 'name', 'Cooking oil')
  )),
-- DSH-131 | sheet: MODIFY -> derived: cannot
('Steamed tofu', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Tofu' AND source_hospital = 'DIETICIAN'), 'name', 'Tofu'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Spring onion' AND source_hospital = 'DIETICIAN'), 'name', 'Spring onion'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Soy sauce' AND source_hospital = 'DIETICIAN'), 'name', 'Soy sauce'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fried shallots' AND source_hospital = 'DIETICIAN'), 'name', 'Fried shallots')
  )),
-- DSH-132 | sheet: REVIEW -> derived: cannot
('Braised tofu', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Tofu' AND source_hospital = 'DIETICIAN'), 'name', 'Tofu'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Mushrooms' AND source_hospital = 'DIETICIAN'), 'name', 'Mushrooms'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Dark soy sauce' AND source_hospital = 'DIETICIAN'), 'name', 'Dark soy sauce')
  )),

-- --- WESTERN / LOCAL ---
-- DSH-133 | sheet: CAN -> derived: review
('Plain pasta', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Pasta' AND source_hospital = 'TTSH'), 'name', 'Pasta'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Cooking oil' AND source_hospital = 'TTSH'), 'name', 'Cooking oil'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Butter' AND source_hospital = 'TTSH'), 'name', 'Butter')
  )),
-- DSH-134 | sheet: REVIEW -> derived: possible
('Cream pasta', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Pasta' AND source_hospital = 'TTSH'), 'name', 'Pasta'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chicken' AND source_hospital = 'TTSH'), 'name', 'Chicken'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Mushrooms' AND source_hospital = 'DIETICIAN'), 'name', 'Mushrooms'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Cream' AND source_hospital = 'TTSH'), 'name', 'Cream')
  )),
-- DSH-135 | sheet: MODIFY -> derived: cannot
('Tomato pasta', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Pasta' AND source_hospital = 'TTSH'), 'name', 'Pasta'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chicken' AND source_hospital = 'TTSH'), 'name', 'Chicken'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Tomato' AND source_hospital = 'DIETICIAN'), 'name', 'Tomato'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Onion' AND source_hospital = 'DIETICIAN'), 'name', 'Onion'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Tomato ketchup' AND source_hospital = 'DIETICIAN'), 'name', 'Tomato ketchup')
  )),
-- DSH-136 | sheet: REVIEW -> derived: review
('Fish and chips', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Potato' AND source_hospital = 'DIETICIAN'), 'name', 'Potato'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Fish' AND source_hospital = 'TTSH'), 'name', 'Fish'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Cooking oil' AND source_hospital = 'TTSH'), 'name', 'Cooking oil')
  )),
-- DSH-137 | sheet: MODIFY -> derived: possible
('Chicken chop', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Potato' AND source_hospital = 'DIETICIAN'), 'name', 'Potato'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'White rice' AND source_hospital = 'TTSH'), 'name', 'White rice'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chicken' AND source_hospital = 'TTSH'), 'name', 'Chicken'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Lettuce' AND source_hospital = 'DIETICIAN'), 'name', 'Lettuce')
  )),
-- DSH-138 | sheet: MODIFY -> derived: possible
('Chicken noodle soup', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Yellow noodles' AND source_hospital = 'TTSH'), 'name', 'Yellow noodles'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Chicken' AND source_hospital = 'TTSH'), 'name', 'Chicken'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Carrot' AND source_hospital = 'DIETICIAN'), 'name', 'Carrot'),
    jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Clear chicken broth' AND source_hospital = 'DIETICIAN'), 'name', 'Clear chicken broth')
  )),
-- DSH-139 | sheet: CAN -> derived: can
('Plain rice noodles', ARRAY['lunch', 'dinner']::dish_meal_type[], 'DIETICIAN',
  jsonb_build_array(jsonb_build_object('id', (SELECT id FROM ingredient_tab WHERE name = 'Bee hoon' AND source_hospital = 'TTSH'), 'name', 'Bee hoon')));
