import type { User as AuthUser } from "@supabase/auth-js";

export type Role = "admin" | "employee";

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface Timesheet {
  id: string;
  user_id: string;
  project_id: string;
  week_id: string;
  monday_hours: number;
  tuesday_hours: number;
  wednesday_hours: number;
  thursday_hours: number;
  friday_hours: number;
  saturday_hours: number;
  sunday_hours: number;
}

export type TimeOffType = "vacation" | "sick" | "personal" | "other";
export type TimeOffStatus = "draft" | "submitted" | "approved" | "rejected";

export interface TimeOffRequest {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  description: string;
  status: TimeOffStatus;
  type: TimeOffType;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  archived: boolean;
  archived_at: string | null;
}

export interface Project {
  id: string;
  name: string;
  client_id: string;
  client?: Client;
  created_at: string;
  updated_at: string;
  archived: boolean;
  archived_at: string | null;
}

export interface TimesheetWithRelations extends Timesheet {
  project: Project & {
    client: Client;
  };
  monday_hours: number;
  tuesday_hours: number;
  wednesday_hours: number;
  thursday_hours: number;
  friday_hours: number;
  saturday_hours: number;
  sunday_hours: number;
}

export type TimesheetStatus = "draft" | "submitted" | "approved" | "rejected";

export interface TimesheetWeek {
  id: string;
  user_id: string;
  project_id: string;
  status: TimesheetStatus;
  approved_by?: string;
  approved_at?: string;
  total_hours: number;
  week_start_date: string;
  updated_at: string;
}

export interface TimesheetWeekWithRelations extends TimesheetWeek {
  user: {
    full_name: string;
    email: string;
  };
  approver?: {
    full_name: string;
  };
  timesheets: TimesheetWithRelations[];
}

// New types for error handling and dashboard
export interface DashboardMetrics {
  total_hours: number;
  pending_timesheets: number;
  pending_timeoffs: number;
}

export interface SupabaseError {
  code: string;
  message: string;
  details?: string;
  hint?: string;
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: string;
}

// Improved type for API responses
export interface ApiResponse<T> {
  data: T | null;
  error: SupabaseError | null;
}

// Type for RPC responses
export interface RpcResponse<T> {
  data: T | null;
  error: SupabaseError | null;
}

// Helper type for database joins
export type WithUser<T> = T & {
  user: {
    id: string;
    email: string;
    full_name: string | null;
    role: Role;
  };
};

export type TimeOffRequestWithUser = WithUser<TimeOffRequest>;
export type TimesheetWeekWithUser = WithUser<TimesheetWeek>;

// Add this type for projects with client info
export type ProjectWithClient = Project & {
  client: Client;
};

// If you need projects with more relations
export type ProjectWithRelations = Project & {
  client: Client;
  timesheets?: TimesheetWithRelations[];
};

// Helper type for auth user data
export type UserWithAuth = AuthUser & Partial<User>;
