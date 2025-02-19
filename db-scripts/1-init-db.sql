-- Create users table
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null unique,
  role text not null check (role in ('admin', 'employee')) default 'employee',
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create clients table
create table public.clients (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create projects table
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  client_id uuid references public.clients on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create timesheets table
create table public.timesheets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  date date not null,
  hours numeric(4,2) not null check (hours > 0 and hours <= 24),
  client_id uuid references public.clients on delete restrict not null,
  project_id uuid references public.projects on delete restrict not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create time_off_requests table
create table public.time_off_requests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  start_date date not null,
  end_date date not null,
  type text not null check (type in ('vacation', 'sick', 'personal')),
  status text not null check (status in ('pending', 'approved', 'rejected')) default 'pending',
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  check (end_date >= start_date)
);