-- First, let's drop the week_id if it exists (from first approach)
ALTER TABLE timesheets DROP COLUMN IF EXISTS week_id;

-- Drop the timesheet_weeks table if it exists
DROP TABLE IF EXISTS timesheet_weeks;

-- Check if we need to rename date to week_start_date
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'timesheets' 
               AND column_name = 'date') THEN
        ALTER TABLE timesheets RENAME COLUMN date TO week_start_date;
    END IF;
END $$;

-- Check and add columns only if they don't exist
DO $$ 
BEGIN
    -- Add daily hours columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'timesheets' 
                  AND column_name = 'monday_hours') THEN
        ALTER TABLE timesheets 
        ADD COLUMN monday_hours numeric DEFAULT 0,
        ADD COLUMN tuesday_hours numeric DEFAULT 0,
        ADD COLUMN wednesday_hours numeric DEFAULT 0,
        ADD COLUMN thursday_hours numeric DEFAULT 0,
        ADD COLUMN friday_hours numeric DEFAULT 0,
        ADD COLUMN saturday_hours numeric DEFAULT 0,
        ADD COLUMN sunday_hours numeric DEFAULT 0;
    END IF;

    -- Add total_hours if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'timesheets' 
                  AND column_name = 'total_hours') THEN
        ALTER TABLE timesheets 
        ADD COLUMN total_hours numeric GENERATED ALWAYS AS (
            COALESCE(monday_hours, 0) + 
            COALESCE(tuesday_hours, 0) + 
            COALESCE(wednesday_hours, 0) + 
            COALESCE(thursday_hours, 0) + 
            COALESCE(friday_hours, 0) + 
            COALESCE(saturday_hours, 0) + 
            COALESCE(sunday_hours, 0)
        ) STORED;
    END IF;
END $$;

-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint 
                  WHERE conname = 'timesheets_user_week_unique') THEN
        ALTER TABLE timesheets 
        ADD CONSTRAINT timesheets_user_week_unique 
        UNIQUE (user_id, week_start_date);
    END IF;
END $$; 