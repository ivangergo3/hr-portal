-- Enable RLS on projects table
alter table public.projects enable row level security;

-- Allow admins to do everything
create policy "Admins can do everything with projects"
on public.projects
for all
to authenticated
using (
  exists (
    select 1 from public.users
    where users.id = auth.uid()
    and users.role = 'admin'
  )
);

-- Allow employees to read non-archived projects
create policy "Employees can view non-archived projects"
on public.projects
for select
to authenticated
using (
  exists (
    select 1 from public.users
    where users.id = auth.uid()
    and users.role = 'employee'
  )
  and (not archived)
); 