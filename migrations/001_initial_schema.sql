-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Types
CREATE TYPE user_role AS ENUM ('admin', 'employee');
CREATE TYPE timesheet_status AS ENUM ('draft', 'submitted', 'approved', 'rejected');
CREATE TYPE time_off_status AS ENUM ('draft', 'submitted', 'approved', 'rejected');
CREATE TYPE time_off_type AS ENUM ('vacation', 'sick', 'personal', 'other');

-- Create Tables
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role user_role NOT NULL DEFAULT 'employee',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    active BOOLEAN DEFAULT true,
    archived_at TIMESTAMPTZ
);

CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    archived BOOLEAN NOT NULL DEFAULT false,
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    client_id UUID NOT NULL REFERENCES clients(id),
    archived BOOLEAN NOT NULL DEFAULT false,
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE timesheet_weeks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    week_start_date DATE NOT NULL,
    status timesheet_status NOT NULL DEFAULT 'draft',
    total_hours NUMERIC(5,2) NOT NULL DEFAULT 0,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, week_start_date)
);

CREATE TABLE timesheets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    week_id UUID REFERENCES timesheet_weeks(id),
    user_id UUID NOT NULL REFERENCES users(id),
    project_id UUID NOT NULL REFERENCES projects(id),
    week_start_date DATE NOT NULL,
    monday_hours NUMERIC(5,2) DEFAULT 0,
    tuesday_hours NUMERIC(5,2) DEFAULT 0,
    wednesday_hours NUMERIC(5,2) DEFAULT 0,
    thursday_hours NUMERIC(5,2) DEFAULT 0,
    friday_hours NUMERIC(5,2) DEFAULT 0,
    saturday_hours NUMERIC(5,2) DEFAULT 0,
    sunday_hours NUMERIC(5,2) DEFAULT 0,
    total_hours NUMERIC(5,2) GENERATED ALWAYS AS (
        COALESCE(monday_hours, 0) +
        COALESCE(tuesday_hours, 0) +
        COALESCE(wednesday_hours, 0) +
        COALESCE(thursday_hours, 0) +
        COALESCE(friday_hours, 0) +
        COALESCE(saturday_hours, 0) +
        COALESCE(sunday_hours, 0)
    ) STORED,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, project_id, week_start_date)
);

CREATE TABLE time_off_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    type time_off_type NOT NULL DEFAULT 'vacation',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    description TEXT,
    status time_off_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (end_date >= start_date)
);

-- Create Indexes
CREATE INDEX idx_timesheet_user ON timesheets(user_id);
CREATE INDEX idx_timesheet_date ON timesheets(week_start_date);
CREATE INDEX idx_timesheet_project ON timesheets(project_id);
CREATE INDEX idx_timesheet_week_user ON timesheet_weeks(user_id);
CREATE INDEX idx_timesheet_week_date ON timesheet_weeks(week_start_date);
CREATE INDEX idx_project_client ON projects(client_id);
CREATE INDEX idx_time_off_user ON time_off_requests(user_id);
CREATE INDEX idx_time_off_dates ON time_off_requests(start_date, end_date);

-- Create Functions
CREATE OR REPLACE FUNCTION get_user_metrics(
    user_id UUID,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ
) RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_hours', COALESCE((
            SELECT SUM(total_hours)
            FROM timesheet_weeks
            WHERE user_id = $1
            AND week_start_date BETWEEN $2 AND $3
        ), 0),
        'pending_timesheets', (
            SELECT COUNT(*)
            FROM timesheet_weeks
            WHERE user_id = $1
            AND status = 'submitted'
        ),
        'pending_timeoffs', (
            SELECT COUNT(*)
            FROM time_off_requests
            WHERE user_id = $1
            AND status = 'submitted'
        )
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create Update Timestamp Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply Update Timestamp Trigger to All Tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timesheet_weeks_updated_at
    BEFORE UPDATE ON timesheet_weeks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timesheets_updated_at
    BEFORE UPDATE ON timesheets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_off_requests_updated_at
    BEFORE UPDATE ON time_off_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Constraints
ALTER TABLE clients ADD CONSTRAINT clients_name_unique UNIQUE (name);
ALTER TABLE projects ADD CONSTRAINT projects_name_client_unique UNIQUE (name, client_id);

-- Functions
CREATE OR REPLACE FUNCTION update_timesheet_week_total_hours()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total_hours in timesheet_weeks
  UPDATE timesheet_weeks
  SET
    total_hours = (
      SELECT COALESCE(SUM(
        COALESCE(monday_hours, 0) +
        COALESCE(tuesday_hours, 0) +
        COALESCE(wednesday_hours, 0) +
        COALESCE(thursday_hours, 0) +
        COALESCE(friday_hours, 0) +
        COALESCE(saturday_hours, 0) +
        COALESCE(sunday_hours, 0)
      ), 0)
      FROM timesheets
      WHERE week_id = NEW.week_id
    ),
    updated_at = now()
  WHERE id = NEW.week_id;

  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION get_dashboard_metrics(start_date timestamp, end_date timestamp)
RETURNS json
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN json_build_object(
    'total_hours', (
      SELECT COALESCE(sum(total_hours), 0)
      FROM timesheet_weeks
      WHERE week_start_date >= $1
      AND week_start_date <= $2
      AND status = 'approved'
    ),

    'active_projects', (
      SELECT COALESCE(count(*), 0)
      FROM projects
      WHERE archived = false
    ),

    'pending_timesheets', (
      SELECT COALESCE(count(*), 0)
      FROM timesheet_weeks
      WHERE status = 'submitted'
      AND week_start_date >= $1
      AND week_start_date <= $2
    ),

    'pending_timeoffs', (
      SELECT COALESCE(count(*), 0)
      FROM time_off_requests
      WHERE status = 'submitted'
      AND time_off_requests.start_date >= $1
      AND time_off_requests.end_date <= $2
    ),

    'active_employees', (
      SELECT COALESCE(count(*), 0)
      FROM users
      WHERE active = true
      AND (archived_at IS NULL OR archived_at > $2)
    )
  );
END;
$$;

-- Triggers
CREATE TRIGGER update_timesheet_week_total_hours
AFTER INSERT OR UPDATE OR DELETE ON timesheets
FOR EACH ROW
EXECUTE FUNCTION update_timesheet_week_total_hours();

-- Row Level Security Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
ON public.users FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view clients"
ON public.clients FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert clients"
ON public.clients FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can update clients"
ON public.clients FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete clients"
ON public.clients FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything with projects"
ON public.projects
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Employees can view non-archived projects"
ON public.projects
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'employee'
  )
  AND (NOT archived)
);

ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own timesheets"
  ON public.timesheets
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all timesheets"
  ON public.timesheets
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

ALTER TABLE public.time_off_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own time off requests"
  ON public.time_off_requests
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own time off requests"
  ON public.time_off_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own draft requests"
  ON public.time_off_requests
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'draft')
  WITH CHECK (auth.uid() = user_id AND status = 'draft');

CREATE POLICY "Admins can view all time off requests"
  ON public.time_off_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update any time off request"
  ON public.time_off_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

ALTER TABLE timesheet_weeks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own weekly timesheets"
  ON timesheet_weeks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weekly timesheets"
  ON timesheet_weeks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly timesheets"
  ON timesheet_weeks
  FOR UPDATE
  USING (
    auth.uid() = user_id
    AND status IN ('draft', 'pending')
  );

CREATE POLICY "Admins can view all weekly timesheets"
  ON timesheet_weeks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update weekly timesheet status"
  ON timesheet_weeks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Data Initialization
INSERT INTO public.clients (name) VALUES
  ('Acme Corp'),
  ('TechStart Inc'),
  ('Global Solutions');

INSERT INTO public.projects (name, client_id)
SELECT 'Website Redesign', id FROM public.clients WHERE name = 'Acme Corp'
UNION ALL
SELECT 'Mobile App', id FROM public.clients WHERE name = 'TechStart Inc'
UNION ALL
SELECT 'Cloud Migration', id FROM public.clients WHERE name = 'Global Solutions'; 