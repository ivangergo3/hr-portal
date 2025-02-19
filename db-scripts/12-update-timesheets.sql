-- Add status and approval fields
alter table public.timesheets 
add column status text not null default 'draft' check (status in ('draft', 'submitted', 'approved', 'rejected')),
add column approved_by uuid references public.users(id),
add column approved_at timestamp with time zone,
add column rejection_reason text;

-- Add RLS policies
alter table public.timesheets enable row level security;

-- Employees can CRUD their own draft timesheets
create policy "Users can manage their own draft timesheets"
on public.timesheets
for all
to authenticated
using (
  user_id = auth.uid() 
  and status = 'draft'
);

-- Employees can read their own submitted/approved/rejected timesheets
create policy "Users can view their own timesheets"
on public.timesheets
for select
to authenticated
using (
  user_id = auth.uid()
);

-- Admins can do everything
create policy "Admins can do everything with timesheets"
on public.timesheets
for all
to authenticated
using (
  exists (
    select 1 from public.users
    where users.id = auth.uid()
    and users.role = 'admin'
  )
); 