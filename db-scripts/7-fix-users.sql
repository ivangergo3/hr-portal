-- 1. First disable RLS temporarily to check data
alter table public.users disable row level security;

-- 2. Clear existing policies
drop policy if exists "Users can view their own data and admins can view all" on public.users;
drop policy if exists "Users can read own data" on public.users;
drop policy if exists "Users can update own data" on public.users;
drop policy if exists "System can insert user data" on public.users;

-- 3. Create simpler policies
create policy "Enable read access for all authenticated users"
on public.users for select
to authenticated
using (true);

create policy "Enable insert access for all authenticated users"
on public.users for insert
to authenticated
with check (true);

create policy "Enable update for users based on id"
on public.users for update
to authenticated
using (auth.uid() = id);

-- 4. Re-enable RLS
alter table public.users enable row level security;

-- 5. Drop and recreate trigger
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

create function public.handle_new_user()
returns trigger
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    'employee'
  );
  return new;
end;
$$ language plpgsql;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Insert current user if not exists
insert into public.users (id, email, full_name, role)
select id, email, email as full_name, 'employee'
from auth.users
on conflict (id) do nothing; 