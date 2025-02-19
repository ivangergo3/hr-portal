-- First, remove the not-null constraint from hours column
ALTER TABLE timesheets 
ALTER COLUMN hours DROP NOT NULL;

-- Then drop the hours column as we're using daily hours now
ALTER TABLE timesheets 
DROP COLUMN hours;

-- Make sure total_hours calculation handles NULLs properly
ALTER TABLE timesheets 
DROP COLUMN IF EXISTS total_hours;

ALTER TABLE timesheets 
ADD COLUMN total_hours numeric GENERATED ALWAYS AS (
  COALESCE(monday_hours, 0) + 
  COALESCE(tuesday_hours, 0) + 
  COALESCE(wednesday_hours, 0) + 
  COALESCE(thursday_hours, 0) + 
  COALESCE(friday_hours, 0) + 
  COALESCE(saturday_hours, 0) + 
  COALESCE(sunday_hours, 0)
) STORED;

-- Remove any NOT NULL constraints if they exist
ALTER TABLE timesheets 
ALTER COLUMN monday_hours DROP NOT NULL,
ALTER COLUMN tuesday_hours DROP NOT NULL,
ALTER COLUMN wednesday_hours DROP NOT NULL,
ALTER COLUMN thursday_hours DROP NOT NULL,
ALTER COLUMN friday_hours DROP NOT NULL,
ALTER COLUMN saturday_hours DROP NOT NULL,
ALTER COLUMN sunday_hours DROP NOT NULL; 