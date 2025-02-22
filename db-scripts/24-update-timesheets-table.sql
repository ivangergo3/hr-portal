CREATE TABLE timesheet_weeks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
  user_id uuid REFERENCES users (id),
  week_start_date date,
  status text DEFAULT 'draft',
  approved_by uuid REFERENCES users (id),
  total_hours numeric,
  UNIQUE (user_id, week_start_date)
);

-- Then link daily entries to weeks
ALTER TABLE timesheets
ADD COLUMN week_id uuid REFERENCES timesheet_weeks (id);

-- Modify timesheets table
ALTER TABLE timesheets
ADD COLUMN monday_hours numeric,
ADD COLUMN tuesday_hours numeric,
ADD COLUMN wednesday_hours numeric,
ADD COLUMN thursday_hours numeric,
ADD COLUMN friday_hours numeric,
ADD COLUMN saturday_hours numeric,
ADD COLUMN sunday_hours numeric;

-- And store project/client per week instead of per day
