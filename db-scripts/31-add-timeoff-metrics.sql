-- Update dashboard metrics function to include pending time-offs
CREATE OR REPLACE FUNCTION get_dashboard_metrics(start_date timestamp, end_date timestamp)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    -- Keep existing metrics
    'total_hours', COALESCE((
      SELECT sum(total_hours)
      FROM timesheet_weeks
      WHERE week_start_date >= start_date
      AND week_start_date <= end_date
      AND status = 'approved'
    ), 0),
    
    'active_projects', COALESCE((
      SELECT count(*)
      FROM projects
      WHERE archived = false
    ), 0),
    
    'pending_timesheets', COALESCE((
      SELECT count(*)
      FROM timesheet_weeks
      WHERE status = 'submitted'
      AND week_start_date >= start_date
      AND week_start_date <= end_date
    ), 0),
    
    'active_employees', COALESCE((
      SELECT count(*)
      FROM users
      WHERE active = true
      AND (archived_at IS NULL OR archived_at > end_date)
    ), 0),

    -- Add new pending time-offs metric
    'pending_timeoffs', COALESCE((
      SELECT count(*)
      FROM time_off_requests
      WHERE status = 'submitted'
      AND start_date >= start_date
      AND end_date <= end_date
    ), 0)
  ) INTO result;
  
  RETURN result;
END;
$$; 