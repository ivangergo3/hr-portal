-- First, ensure RLS is enabled
alter table public.clients enable row level security;

-- Drop existing policies if any
drop policy if exists "Authenticated users can view clients" on public.clients;

drop policy if exists "Admins can insert clients" on public.clients;

drop policy if exists "Admins can update clients" on public.clients;

drop policy if exists "Admins can delete clients" on public.clients;

-- Create new policies
-- Everyone can view clients
create policy "Authenticated users can view clients" on public.clients for
select
  to authenticated using (true);

-- Only admins can insert new clients
create policy "Admins can insert clients" on public.clients for insert to authenticated
with
  check (
    exists (
      select
        1
      from
        public.users
      where
        id = auth.uid ()
        and role = 'admin'
    )
  );

-- Only admins can update clients
create policy "Admins can update clients" on public.clients for
update to authenticated using (
  exists (
    select
      1
    from
      public.users
    where
      id = auth.uid ()
      and role = 'admin'
  )
)
with
  check (
    exists (
      select
        1
      from
        public.users
      where
        id = auth.uid ()
        and role = 'admin'
    )
  );

-- Only admins can delete clients
create policy "Admins can delete clients" on public.clients for delete to authenticated using (
  exists (
    select
      1
    from
      public.users
    where
      id = auth.uid ()
      and role = 'admin'
  )
);
