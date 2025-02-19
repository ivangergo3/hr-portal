-- Update status constraint to include 'draft' and 'pending'
ALTER TABLE public.time_off_requests 
  DROP CONSTRAINT IF EXISTS time_off_requests_status_check,
  ADD CONSTRAINT time_off_requests_status_check 
  CHECK (status IN ('draft', 'pending', 'approved', 'rejected')); 