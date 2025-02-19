"use client";

import { useState } from "react";
import {
  User,
  DashboardMetrics,
  TimesheetWeek,
  TimeOffRequest,
} from "@/types/database.types";

interface DashboardViewProps {
  user: User;
  metrics: DashboardMetrics;
  timeOffRequests: TimeOffRequest[];
  timesheets: TimesheetWeek[];
}

export default function DashboardView({
  metrics,
  timeOffRequests,
  timesheets,
}: DashboardViewProps) {
  const [error, setError] = useState<string | null>(null);

  if (!metrics || !timeOffRequests || !timesheets) {
    setError("Unable to load dashboard data");
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold text-slate-900">
          Dashboard data unavailable
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Please try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ... existing JSX ... */}

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
