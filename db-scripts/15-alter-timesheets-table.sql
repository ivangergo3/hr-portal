ALTER TABLE public.timesheets 
  ALTER COLUMN project_id DROP NOT NULL,
  ALTER COLUMN client_id DROP NOT NULL;

ALTER TABLE public.timesheets 
  DROP CONSTRAINT IF EXISTS timesheets_hours_check,
  ADD CONSTRAINT timesheets_hours_check 
    CHECK (hours >= 0 AND hours <= 24);