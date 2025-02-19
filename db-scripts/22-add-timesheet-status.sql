-- Add status column if it doesn't exist
ALTER TABLE public.timesheets 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft'
CHECK (status IN ('draft', 'pending', 'approved', 'rejected'));

-- Update existing timesheets to have a status
UPDATE public.timesheets 
SET status = 'pending' 
WHERE status IS NULL; 