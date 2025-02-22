-- Enable RLS on timesheets table
ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own timesheets
CREATE POLICY "Users can view their own timesheets" ON public.timesheets FOR
SELECT
  USING (auth.uid () = user_id);

-- Policy for admins to view all timesheets
CREATE POLICY "Admins can view all timesheets" ON public.timesheets FOR
SELECT
  USING (
    EXISTS (
      SELECT
        1
      FROM
        public.users
      WHERE
        users.id = auth.uid ()
        AND users.role = 'admin'
    )
  );

-- Policy for admins to update any timesheet status
CREATE POLICY "Admins can update timesheet status" ON public.timesheets FOR
UPDATE USING (
  EXISTS (
    SELECT
      1
    FROM
      public.users
    WHERE
      users.id = auth.uid ()
      AND users.role = 'admin'
  )
);
