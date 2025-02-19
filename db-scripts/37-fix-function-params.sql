-- Drop the existing function
DROP FUNCTION IF EXISTS get_dashboard_metrics(timestamp, timestamp);

-- Recreate with matching parameter names
CREATE OR REPLACE FUNCTION get_dashboard_metrics(start_date timestamp, end_date timestamp)
RETURNS json
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN json_build_object(
    'total_hours', (
      SELECT COALESCE(sum(total_hours), 0)
      FROM timesheet_weeks
      WHERE week_start_date >= $1
      AND week_start_date <= $2
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
      AND week_start_date >= $1
      AND week_start_date <= $2
    ),
    
    'pending_timeoffs', (
      SELECT COALESCE(count(*), 0)
      FROM time_off_requests
      WHERE status = 'submitted'
      AND time_off_requests.start_date >= $1
      AND time_off_requests.end_date <= $2
    ),
    
    'active_employees', (
      SELECT COALESCE(count(*), 0)
      FROM users
      WHERE active = true
      AND (archived_at IS NULL OR archived_at > $2)
    )
  );
END;
$$;

-- Test the function
SELECT get_dashboard_metrics(
  date_trunc('month', current_date)::timestamp,
  (date_trunc('month', current_date) + interval '1 month' - interval '1 day')::timestamp
); 