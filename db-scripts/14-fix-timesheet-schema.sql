-- First, let's check and fix the timesheet table structure
alter table public.timesheets
alter column created_at
set default now (),
alter column updated_at
set default now (),
alter column description
set default '',
-- Make sure all required fields have proper defaults
alter column status
set default 'draft',
-- Drop the not null constraint on approved fields since they're only needed for approved status
alter column approved_by
drop not null,
alter column approved_at
drop not null;
