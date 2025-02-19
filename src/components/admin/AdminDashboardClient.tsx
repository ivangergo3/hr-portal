"use client";

import React, { useState, useEffect } from "react";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { startOfMonth, endOfMonth } from "date-fns";
import type { DashboardMetrics } from "@/components/admin/AdminDashboard";
import DataErrorBoundary from "@/components/common/DataErrorBoundary";
import type { Timesheet } from "@/components/admin/AdminDashboard";
import { PostgrestError } from "@supabase/supabase-js";
import { createClientServer } from "@/utils/supabase/server";
type TimesheetResponse = {
  id: string;
  total_hours: number;
  week_start_date: string;
  project: {
    id: string;
    name: string;
    client: {
      name: string;
    };
  };
  user: {
    full_name: string;
  };
  timesheet_week: {
    status: string;
    week_start_date: string;
  };
};

const defaultDateRange = {
  from: startOfMonth(new Date()),
  to: endOfMonth(new Date()),
};

export default function AdminDashboardClient() {
  const [dateRange, setDateRange] = useState(defaultDateRange);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [timesheets, setTimesheets] = useState<TimesheetResponse[] | null>(
    null
  );

  useEffect(() => {
    async function fetchData() {
      const supabase = await createClientServer();

      try {
        // Get dashboard metrics
        const { data: metrics, error: metricsError } = await supabase.rpc(
          "get_dashboard_metrics",
          {
            start_date: dateRange.from,
            end_date: dateRange.to,
          }
        );

        if (metricsError) {
          console.error(
            "[Admin Dashboard] Metrics error:",
            metricsError.message
          );
          throw metricsError;
        }

        // Get timesheets with related data
        const { data: timesheets, error: timesheetsError } = (await supabase
          .from("timesheets")
          .select(
            `
            id,
            total_hours,
            week_start_date,
            project:projects (
              id,
              name,
              client:clients (
                name
              )
            ),
            user:users!timesheets_user_id_fkey (
              full_name
            ),
            timesheet_week:timesheet_weeks (
              status,
              week_start_date
            )
          `
          )
          .gte("week_start_date", dateRange.from.toISOString())
          .lte("week_start_date", dateRange.to.toISOString())) as {
          data: TimesheetResponse[] | null;
          error: PostgrestError | null;
        };

        if (timesheetsError) {
          console.error(
            "[Admin Dashboard] Timesheet error:",
            timesheetsError.message
          );
          throw timesheetsError;
        }

        setMetrics(metrics);
        setTimesheets(timesheets);
      } catch (error) {
        console.error("[Admin Dashboard] Data fetch error:", error);
      }
    }

    fetchData();
  }, [dateRange]);

  return (
    <DataErrorBoundary>
      <AdminDashboard
        metrics={
          metrics || {
            total_hours: 0,
            active_projects: 0,
            pending_timesheets: 0,
            pending_timeoffs: 0,
            active_employees: 0,
          }
        }
        timesheets={
          timesheets
            ?.map((t: TimesheetResponse) => {
              if (!t.project || !t.user || !t.timesheet_week) {
                console.warn(
                  "[Admin Dashboard] Skipping invalid timesheet entry:",
                  t
                );
                return null;
              }

              return {
                ...t,
                project: {
                  ...t.project,
                  client: t.project.client || { name: "Unknown Client" },
                },
                user: t.user,
                timesheet_week: t.timesheet_week,
              };
            })
            .filter((t): t is Timesheet => t !== null) || []
        }
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />
    </DataErrorBoundary>
  );
}
