-- First drop the existing constraint
ALTER TABLE timesheets
DROP CONSTRAINT IF EXISTS timesheets_user_week_unique;

-- Add new constraint that includes project_id
ALTER TABLE timesheets ADD CONSTRAINT timesheets_user_week_project_unique UNIQUE (user_id, week_start_date, project_id);
