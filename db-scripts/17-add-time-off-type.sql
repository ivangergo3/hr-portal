-- Add type field to time_off_requests
ALTER TABLE public.time_off_requests 
  ADD COLUMN type text NOT NULL DEFAULT 'vacation';

-- Create enum-like constraint for type
ALTER TABLE public.time_off_requests
  ADD CONSTRAINT time_off_requests_type_check 
  CHECK (type IN ('vacation', 'sick', 'personal', 'other')); 