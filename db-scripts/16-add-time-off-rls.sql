-- Enable RLS on time_off_requests table
ALTER TABLE public.time_off_requests ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own requests
CREATE POLICY "Users can view their own time off requests" ON public.time_off_requests FOR
SELECT
  USING (auth.uid () = user_id);

-- Policy for users to insert their own requests
CREATE POLICY "Users can create their own time off requests" ON public.time_off_requests FOR INSERT
WITH
  CHECK (auth.uid () = user_id);

-- Policy for users to update their own draft requests
CREATE POLICY "Users can update their own draft requests" ON public.time_off_requests FOR
UPDATE USING (
  auth.uid () = user_id
  AND status = 'draft'
)
WITH
  CHECK (
    auth.uid () = user_id
    AND status = 'draft'
  );

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

-- Policy for admins to update any request
CREATE POLICY "Admins can update any time off request" ON public.time_off_requests FOR
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
