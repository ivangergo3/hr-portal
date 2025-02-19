-- Debug queries for metrics

-- Check total approved hours
SELECT sum(total_hours)
FROM timesheet_weeks
WHERE week_start_date >= '2024-03-01'
AND week_start_date <= '2024-03-31'
AND status = 'approved';

-- Check active projects
SELECT count(*)
FROM projects
WHERE archived = false;

-- Check pending timesheets
SELECT count(*)
FROM timesheet_weeks
WHERE status = 'submitted'
AND week_start_date >= '2024-03-01'
AND week_start_date <= '2024-03-31';

-- Check active employees
SELECT count(*)
FROM users
WHERE active = true
AND (archived_at IS NULL OR archived_at > '2024-03-31');

-- Check pending time-offs
SELECT count(*)
FROM time_off_requests
WHERE status = 'submitted'
AND start_date >= '2024-03-01'
AND end_date <= '2024-03-31';

-- Check if we have any timesheet_weeks at all
SELECT status, count(*)
FROM timesheet_weeks
GROUP BY status;

-- Check if we have any time_off_requests at all
SELECT status, count(*)
FROM time_off_requests
GROUP BY status; 