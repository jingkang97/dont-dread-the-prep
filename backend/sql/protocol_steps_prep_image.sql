-- Per-dose prep mix diagram label (matches frontend asset basename without .png).
-- Depends on: protocol_steps.sql
-- Renames earlier draft column mix_sheet_key when present.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'protocol_steps'
      AND column_name = 'mix_sheet_key'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'protocol_steps'
      AND column_name = 'prep_image_label'
  ) THEN
    ALTER TABLE protocol_steps RENAME COLUMN mix_sheet_key TO prep_image_label;
  ELSIF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'protocol_steps'
      AND column_name = 'prep_image_label'
  ) THEN
    ALTER TABLE protocol_steps ADD COLUMN prep_image_label TEXT;
  END IF;
END $$;
