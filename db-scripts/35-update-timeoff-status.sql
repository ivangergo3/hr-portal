-- First check what statuses we currently have
SELECT DISTINCT status FROM time_off_requests;

-- Drop the existing constraint
ALTER TABLE time_off_requests 
DROP CONSTRAINT IF EXISTS time_off_requests_status_check;

-- Update any invalid statuses to 'submitted' before adding the new constraint
UPDATE time_off_requests 
SET status = 'submitted' 
WHERE status NOT IN ('draft', 'submitted', 'approved', 'rejected');

-- Add the new constraint
ALTER TABLE time_off_requests
ADD CONSTRAINT time_off_requests_status_check 
CHECK (status IN ('draft', 'submitted', 'approved', 'rejected'));

-- Then recreate the dashboard metrics function
DROP FUNCTION IF EXISTS get_dashboard_metrics(timestamp, timestamp);

CREATE OR REPLACE FUNCTION get_dashboard_metrics(p_start_date timestamp, p_end_date timestamp)
RETURNS json
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN json_build_object(
    'total_hours', (
      SELECT COALESCE(sum(total_hours), 0)
      FROM timesheet_weeks
      WHERE week_start_date >= p_start_date
      AND week_start_date <= p_end_date
      AND status = 'approved'
    ),
    
    'active_projects', (
      SELECT COALESCE(count(*), 0)
      FROM projects
      WHERE archived = false
    ),
    
    'pending_timesheets', (
      SELECT COALESCE(count(*), 0)
      FROM timesheet_weeks
      WHERE status = 'submitted'
      AND week_start_date >= p_start_date
      AND week_start_date <= p_end_date
    ),
    
    'pending_timeoffs', (
      SELECT COALESCE(count(*), 0)
      FROM time_off_requests
      WHERE status = 'submitted'
      AND start_date >= p_start_date
      AND end_date <= p_end_date
    ),
    
    'active_employees', (
      SELECT COALESCE(count(*), 0)
      FROM users
      WHERE active = true
      AND (archived_at IS NULL OR archived_at > p_end_date)
    )
  );
END;
$$;

-- Test the function
SELECT get_dashboard_metrics(
  date_trunc('month', current_date)::timestamp,
  (date_trunc('month', current_date) + interval '1 month' - interval '1 day')::timestamp
); 