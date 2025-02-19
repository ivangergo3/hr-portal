-- Enable RLS on timesheet_weeks table
ALTER TABLE timesheet_weeks ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own weekly timesheets
CREATE POLICY "Users can view their own weekly timesheets"
  ON timesheet_weeks
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to insert their own weekly timesheets
CREATE POLICY "Users can insert their own weekly timesheets"
  ON timesheet_weeks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own draft/pending weekly timesheets
CREATE POLICY "Users can update their own weekly timesheets"
  ON timesheet_weeks
  FOR UPDATE
  USING (
    auth.uid() = user_id 
    AND status IN ('draft', 'pending')
  );

-- Policy for admins to view all weekly timesheets
CREATE POLICY "Admins can view all weekly timesheets"
  ON timesheet_weeks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Policy for admins to update any weekly timesheet status
CREATE POLICY "Admins can update weekly timesheet status"
  ON timesheet_weeks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  ); 