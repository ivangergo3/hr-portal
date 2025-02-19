-- Add active status to users table
ALTER TABLE users 
ADD COLUMN active boolean DEFAULT true,
ADD COLUMN archived_at timestamp with time zone;

-- Create or update dashboard metrics function
CREATE OR REPLACE FUNCTION get_dashboard_metrics(start_date timestamp, end_date timestamp)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    -- Get total hours from approved timesheets
    'total_hours', COALESCE((
      SELECT sum(total_hours)
      FROM timesheet_weeks
      WHERE week_start_date >= start_date
      AND week_start_date <= end_date
      AND status = 'approved'  -- Only count approved hours
    ), 0),
    
    -- Get count of non-archived projects
    'active_projects', COALESCE((
      SELECT count(*)
      FROM projects
      WHERE archived = false
    ), 0),
    
    -- Get count of submitted (pending) timesheets
    'pending_timesheets', COALESCE((
      SELECT count(*)
      FROM timesheet_weeks
      WHERE status = 'submitted'
      AND week_start_date >= start_date
      AND week_start_date <= end_date
    ), 0),
    
    -- Get count of all active users (both employees and admins)
    'active_employees', COALESCE((
      SELECT count(*)
      FROM users
      WHERE active = true
      AND (archived_at IS NULL OR archived_at > end_date)
    ), 0)
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Update all existing users to be active
UPDATE users SET active = true WHERE active IS NULL; 