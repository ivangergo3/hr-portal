-- Check existing policies
select
  *
from
  pg_policies
where
  schemaname = 'public';

-- Ensure users can read their own data
create policy "Users can read own data" on public.users for
select
  to authenticated using (auth.uid () = id);

-- Ensure users can update their own data
create policy "Users can update own data" on public.users for
update to authenticated using (auth.uid () = id)
with
  check (auth.uid () = id);

-- Ensure system can insert user data
create policy "System can insert user data" on public.users for insert to authenticated
with
  check (true);
