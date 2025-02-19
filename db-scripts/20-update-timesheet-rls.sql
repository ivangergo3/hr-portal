-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own timesheets" ON public.timesheets;
DROP POLICY IF EXISTS "Admins can view all timesheets" ON public.timesheets;
DROP POLICY IF EXISTS "Admins can update timesheet status" ON public.timesheets;

-- Recreate policies with correct permissions
CREATE POLICY "Users can view their own timesheets"
  ON public.timesheets
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all timesheets"
  ON public.timesheets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update timesheet status"
  ON public.timesheets
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  ); 