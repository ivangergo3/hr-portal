-- First, add archived columns
alter table public.clients 
add column archived boolean default false,
add column archived_at timestamp with time zone;

-- Find and handle duplicate names
with duplicates as (
  select name, count(*), array_agg(id order by created_at) as ids
  from public.clients
  group by name
  having count(*) > 1
)
update public.clients c
set name = c.name || ' (' || i.index || ')'
from (
  select id, name, 
         row_number() over (partition by name order by created_at) as index
  from public.clients
  where id in (
    select unnest(ids[2:]) -- Skip the first one (keep original name)
    from duplicates
  )
) i
where c.id = i.id;

-- Now we can safely add the unique constraint
alter table public.clients 
add constraint clients_name_unique unique (name); 