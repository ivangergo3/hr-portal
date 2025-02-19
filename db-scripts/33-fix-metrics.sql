-- Drop the existing function first
DROP FUNCTION IF EXISTS get_dashboard_metrics(timestamp, timestamp);

-- Add logging to metrics function
CREATE OR REPLACE FUNCTION get_dashboard_metrics(p_start_date timestamp, p_end_date timestamp)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
  v_total_hours numeric;
  v_active_projects integer;
  v_pending_timesheets integer;
  v_pending_timeoffs integer;
  v_active_employees integer;
BEGIN
  -- Get total approved hours
  SELECT COALESCE(sum(total_hours), 0)
  INTO v_total_hours
  FROM timesheet_weeks
  WHERE week_start_date >= p_start_date
  AND week_start_date <= p_end_date
  AND status = 'approved';
  
  RAISE NOTICE 'Total hours: %', v_total_hours;

  -- Get active projects
  SELECT COALESCE(count(*), 0)
  INTO v_active_projects
  FROM projects
  WHERE archived = false;
  
  RAISE NOTICE 'Active projects: %', v_active_projects;

  -- Get pending timesheets
  SELECT COALESCE(count(*), 0)
  INTO v_pending_timesheets
  FROM timesheet_weeks
  WHERE status = 'submitted'
  AND week_start_date >= p_start_date
  AND week_start_date <= p_end_date;
  
  RAISE NOTICE 'Pending timesheets: %', v_pending_timesheets;

  -- Get pending time-offs
  SELECT COALESCE(count(*), 0)
  INTO v_pending_timeoffs
  FROM time_off_requests
  WHERE status = 'submitted'
  AND start_date >= p_start_date
  AND end_date <= p_end_date;
  
  RAISE NOTICE 'Pending time-offs: %', v_pending_timeoffs;

  -- Get active employees
  SELECT COALESCE(count(*), 0)
  INTO v_active_employees
  FROM users
  WHERE active = true
  AND (archived_at IS NULL OR archived_at > p_end_date);
  
  RAISE NOTICE 'Active employees: %', v_active_employees;

  -- Build result
  SELECT json_build_object(
    'total_hours', v_total_hours,
    'active_projects', v_active_projects,
    'pending_timesheets', v_pending_timesheets,
    'pending_timeoffs', v_pending_timeoffs,
    'active_employees', v_active_employees
  ) INTO result;

  RETURN result;
END;
$$;

-- Test the function
SELECT get_dashboard_metrics(
  (current_date - interval '30 days')::timestamp,
  current_date::timestamp
); 