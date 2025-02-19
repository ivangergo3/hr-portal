-- Create timesheet_weeks table for weekly summaries
CREATE TABLE timesheet_weeks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id),
  week_start_date date,
  status text DEFAULT 'draft',
  approved_by uuid REFERENCES users(id),
  approved_at timestamp with time zone,
  rejection_reason text,
  total_hours numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, week_start_date)
);

-- Add week_id to timesheets table
ALTER TABLE timesheets 
ADD COLUMN week_id uuid REFERENCES timesheet_weeks(id);

-- Create function to calculate and update total_hours
CREATE OR REPLACE FUNCTION update_timesheet_week_total_hours()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total_hours in timesheet_weeks
  UPDATE timesheet_weeks 
  SET 
    total_hours = (
      SELECT COALESCE(SUM(
        COALESCE(monday_hours, 0) + 
        COALESCE(tuesday_hours, 0) + 
        COALESCE(wednesday_hours, 0) + 
        COALESCE(thursday_hours, 0) + 
        COALESCE(friday_hours, 0) + 
        COALESCE(saturday_hours, 0) + 
        COALESCE(sunday_hours, 0)
      ), 0)
      FROM timesheets 
      WHERE week_id = NEW.week_id
    ),
    updated_at = now()
  WHERE id = NEW.week_id;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to update total_hours
CREATE TRIGGER update_timesheet_week_total_hours
AFTER INSERT OR UPDATE OR DELETE ON timesheets
FOR EACH ROW
EXECUTE FUNCTION update_timesheet_week_total_hours(); 