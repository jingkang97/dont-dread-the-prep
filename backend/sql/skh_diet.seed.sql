-- SKH low-residue diet lead-in (−3 days) for all prep except Fleet.
-- Depends on: SKH protocols + protocol_versions already in DB.
-- Safe to re-run (skips versions that already have a diet step).

INSERT INTO protocol_steps (
  protocol_version_id, kind, slot, timing_mode, day_offset, clock_time,
  hours_before_report, title, detail, tentative, sort_order
)
SELECT
  pv.id,
  'diet',
  'any'::step_slot,
  'day_clock'::timing_mode,
  -3,
  TIME '00:00',
  NULL,
  'Start low-residue diet (3 days)',
  'A low-residue diet is a temporary eating plan that limits high-fiber foods and other hard-to-digest items to reduce the amount of undigested material passing through your large intestine.',
  false,
  30
FROM protocol_versions pv
JOIN protocols p ON p.id = pv.protocol_id
WHERE p.name LIKE 'skh-%'
  AND p.prep_agent <> 'fleet'
  AND NOT EXISTS (
    SELECT 1 FROM protocol_steps ps
    WHERE ps.protocol_version_id = pv.id AND ps.kind = 'diet'
  );
