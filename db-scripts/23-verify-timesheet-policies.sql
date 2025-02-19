-- First, drop existing policies
DROP POLICY IF EXISTS "Users can view their own timesheets" ON public.timesheets;
DROP POLICY IF EXISTS "Admins can view all timesheets" ON public.timesheets;
DROP POLICY IF EXISTS "Admins can update timesheet status" ON public.timesheets;

-- Enable RLS (if not already enabled)
ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Users can view their own timesheets"
  ON public.timesheets
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all timesheets"
  ON public.timesheets
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  ); 