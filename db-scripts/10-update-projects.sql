-- Add unique constraint to project name within a client
alter table public.projects 
add constraint projects_name_client_unique unique (name, client_id);

-- Add archived column with default false
alter table public.projects 
add column archived boolean default false,
add column archived_at timestamp with time zone; 