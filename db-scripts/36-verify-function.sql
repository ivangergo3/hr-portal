-- Check if function exists and is accessible
SELECT
  p.proname AS function_name,
  pg_get_function_result (p.oid) AS result_type,
  pg_get_function_arguments (p.oid) AS argument_types,
  CASE
    WHEN p.proisstrict THEN 'strict'
    ELSE 'not strict'
  END AS strictness
FROM
  pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE
  n.nspname = 'public' -- schema name
  AND p.proname = 'get_dashboard_metrics';

-- Test the function with explicit type casts
SELECT
  get_dashboard_metrics (
    CAST(CURRENT_DATE AS timestamp),
    CAST(CURRENT_DATE + INTERVAL '1 day' AS timestamp)
  );
