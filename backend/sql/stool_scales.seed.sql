-- Bristol (fallback for hospitals with no chart) + TTSH / SKH cup scales.
-- Depends on: mvp.sql, mvp.seed.sql, stool_scales.sql.
-- Safe to re-run.
--
-- TTSH → ttsh-6. SKH → skh-6. SGH / NCCS stay null → API resolves to Bristol.

INSERT INTO stool_scales (key, show_ready_badges, not_ready_action)
VALUES
  ('bristol', false, NULL),
  (
    'ttsh-6',
    true,
    'Please report to the Endoscopy Centre 2 hours before your appointment time if your stools appears like those of stage 1-4.'
  ),
  (
    'skh-6',
    true,
    'If your stool still looks like stages 1–3, call Planned Admissions or report early.'
  )
ON CONFLICT (key) DO UPDATE SET
  show_ready_badges = EXCLUDED.show_ready_badges,
  not_ready_action = EXCLUDED.not_ready_action;

INSERT INTO stool_scale_stages (scale_id, n, name, look, ready, color, photo)
SELECT s.id, v.n, v.name, v.look, v.ready, v.color, v.photo
FROM stool_scales s
JOIN (
  VALUES
    ('ttsh-6', 1, 'Solid lumps', 'Dark, thick lumps. Heavy residue, not watery.', 'not', '#5c3a24', 'ttsh/s1.png'),
    ('ttsh-6', 2, 'Soft blobs', 'Brown soft blobs. Lots of residue still in the cup.', 'not', '#7a4a28', 'ttsh/s2.png'),
    ('ttsh-6', 3, 'Cloudy brown', 'Cloudy brown liquid with particles throughout.', 'not', '#8a5a2a', 'ttsh/s3.png'),
    ('ttsh-6', 4, 'Dark liquid', 'Dark orange liquid. Some residue left, not yet clear.', 'not', '#c47a2b', 'ttsh/s4.png'),
    ('ttsh-6', 5, 'Light orange', 'Light orange. Little residue.', 'ready', '#e6c35c', 'ttsh/s5.png'),
    ('ttsh-6', 6, 'Clear yellow', 'Clear yellow, watery, no residue.', 'ready', '#e6c35c', 'ttsh/s6.png'),
    ('skh-6', 1, 'Dark with materials', 'Very dark liquid with solid materials at the bottom.', 'not', '#3b2418', 'skh/1.png'),
    ('skh-6', 2, 'Brown with materials', 'Brown liquid with materials still sitting at the bottom.', 'not', '#6b3f24', 'skh/2.png'),
    ('skh-6', 3, 'Dark orange', 'Dark orange. Some particles left.', 'not', '#c45f18', 'skh/3.png'),
    ('skh-6', 4, 'Light orange', 'Light orange. Little residue.', 'almost', '#e8993a', 'skh/4.png'),
    ('skh-6', 5, 'Clear yellow', 'Clear yellow, watery, no residue.', 'ready', '#e6c35c', 'skh/5.png'),
    ('bristol', 1, 'Type 1', 'Separate hard lumps, like nuts', NULL::text, NULL::text, NULL),
    ('bristol', 2, 'Type 2', 'Sausage-shaped but lumpy', NULL, NULL, NULL),
    ('bristol', 3, 'Type 3', 'Like a sausage with cracks on the surface', NULL, NULL, NULL),
    ('bristol', 4, 'Type 4', 'Like a sausage or snake, smooth and soft', NULL, NULL, NULL),
    ('bristol', 5, 'Type 5', 'Soft blobs with clear-cut edges', NULL, NULL, NULL),
    ('bristol', 6, 'Type 6', 'Fluffy pieces with ragged edges, mushy', NULL, NULL, NULL),
    ('bristol', 7, 'Type 7', 'Watery, no solid pieces, entirely liquid', NULL, NULL, NULL)
) AS v(scale_key, n, name, look, ready, color, photo)
  ON s.key = v.scale_key
ON CONFLICT (scale_id, n) DO UPDATE SET
  name = EXCLUDED.name,
  look = EXCLUDED.look,
  ready = EXCLUDED.ready,
  color = EXCLUDED.color,
  photo = EXCLUDED.photo;

-- SKH is a 5-stage chart. Drop the old placeholder stage 6 if it is still stored.
DELETE FROM stool_scale_stages st
USING stool_scales s
WHERE st.scale_id = s.id
  AND s.key = 'skh-6'
  AND st.n > 5;

UPDATE hospitals
SET stool_scale_id = (SELECT id FROM stool_scales WHERE key = 'ttsh-6')
WHERE code = 'ttsh';

UPDATE hospitals
SET stool_scale_id = (SELECT id FROM stool_scales WHERE key = 'skh-6')
WHERE code = 'skh';
