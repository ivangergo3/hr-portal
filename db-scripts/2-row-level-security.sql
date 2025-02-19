-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.timesheets enable row level security;
alter table public.time_off_requests enable row level security;

-- Users policies
create policy "Users can view their own data and admins can view all"
on public.users for select
to authenticated
using (
  auth.uid() = id 
  or exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  )
);

-- Clients policies (viewable by all authenticated users)
create policy "Authenticated users can view clients"
on public.clients for select
to authenticated
using (true);

-- Projects policies (viewable by all authenticated users)
create policy "Authenticated users can view projects"
on public.projects for select
to authenticated
using (true);

-- Timesheets policies
create policy "Users can view their own timesheets and admins can view all"
on public.timesheets for select
to authenticated
using (
  user_id = auth.uid() 
  or exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  )
);

-- Time off requests policies
create policy "Users can view their own time off requests and admins can view all"
on public.time_off_requests for select
to authenticated
using (
  user_id = auth.uid() 
  or exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  )
);