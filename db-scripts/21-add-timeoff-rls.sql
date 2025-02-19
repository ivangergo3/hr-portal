-- Enable RLS on time_off_requests table
ALTER TABLE public.time_off_requests ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own requests
CREATE POLICY "Users can view their own time off requests" ON public.time_off_requests FOR
SELECT
  USING (auth.uid () = user_id);

-- Policy for admins to view all requests
CREATE POLICY "Admins can view all time off requests" ON public.time_off_requests FOR
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

-- Policy for admins to update request status
CREATE POLICY "Admins can update time off request status" ON public.time_off_requests FOR
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
