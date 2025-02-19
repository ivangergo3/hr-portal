-- Add unique constraint to prevent duplicate projects per day per user
alter table public.timesheets 
add constraint timesheets_user_project_date_key 
unique (user_id, project_id, date);

-- Add indexes for common queries
create index idx_timesheets_user_date 
on public.timesheets(user_id, date);

create index idx_timesheets_status 
on public.timesheets(status);

-- Add trigger for updating timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_timesheets_updated_at
  before update on public.timesheets
  for each row
  execute function public.handle_updated_at();

-- Add check constraint for hours
alter table public.timesheets
add constraint timesheets_hours_check
check (hours >= 0 and hours <= 24); 