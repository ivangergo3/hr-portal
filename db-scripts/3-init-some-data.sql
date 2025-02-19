-- Insert test clients
insert into public.clients (name) values
  ('Acme Corp'),
  ('TechStart Inc'),
  ('Global Solutions');

-- Insert test projects (after clients are created)
insert into public.projects (name, client_id) 
select 'Website Redesign', id from public.clients where name = 'Acme Corp'
union all
select 'Mobile App', id from public.clients where name = 'TechStart Inc'
union all
select 'Cloud Migration', id from public.clients where name = 'Global Solutions';

-- For users, we'll need to manually add entries after someone logs in
-- The following trigger will help automate user creation:
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'employee');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();