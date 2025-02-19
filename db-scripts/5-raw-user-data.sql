insert into public.users (id, email, full_name, role)
select 
  id,
  email,
  coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', email),
  'employee'
from auth.users
on conflict (id) do update
set 
  email = excluded.email,
  full_name = excluded.full_name;