"use client";

import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Notification from "@/components/common/Notification";
import Link from "next/link";
import WeekNavigation from "@/components/timesheets/WeekNavigation";
import { useRouter } from "next/navigation";
import {
  TimesheetWeekWithRelations,
  TimesheetWithRelations,
  TimesheetStatus,
} from "@/types/database.types";
import { withRetry } from "@/utils/apiRetry";
import { createClientServer } from "@/utils/supabase/server";

interface WeeklyTimesheet {
  id: string;
  user: {
    full_name: string;
    email: string;
  };
  week_start_date: string;
  monday_hours: number;
  tuesday_hours: number;
  wednesday_hours: number;
  thursday_hours: number;
  friday_hours: number;
  saturday_hours: number;
  sunday_hours: number;
  total_hours: number;
  status: TimesheetStatus;
  project: {
    name: string;
  };
  client: {
    name: string;
  };
}

interface TimesheetApprovalsProps {
  weeklyTimesheets: TimesheetWeekWithRelations[];
  currentWeek: Date;
}

export default function TimesheetApprovals({
  weeklyTimesheets: initialWeeklyTimesheets,
  currentWeek,
}: TimesheetApprovalsProps) {
  const router = useRouter();

  const [timesheets, setTimesheets] = useState(initialWeeklyTimesheets);
  const [selectedTimesheet, setSelectedTimesheet] =
    useState<WeeklyTimesheet | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | TimesheetStatus>(
    "all"
  );

  const supabase = createClientServer();

  useEffect(() => {
    setTimesheets(initialWeeklyTimesheets);
  }, [initialWeeklyTimesheets]);

  const filteredTimesheets =
    statusFilter === "all"
      ? timesheets
      : timesheets.filter((week) => week.status === statusFilter);

  const handleAction = async (
    timesheet: WeeklyTimesheet,
    action: "approve" | "reject"
  ) => {
    try {
      setError(null);
      setIsUpdating(true);

      await withRetry(
        async () => {
          const { error: updateError } = await (
            await supabase
          )
            .from("timesheet_weeks")
            .update({
              status: action === "approve" ? "approved" : "rejected",
              updated_at: new Date().toISOString(),
            })
            .eq("id", timesheet.id);
          if (updateError) throw updateError;
          return true;
        },
        { maxAttempts: 3, delayMs: 1000 }
      );

      setTimesheets((prev) =>
        prev.map((t) =>
          t.id === timesheet.id
            ? { ...t, status: action === "approve" ? "approved" : "rejected" }
            : t
        )
      );

      setNotification({
        message: `Timesheet ${action}d successfully`,
        type: "success",
      });
    } catch (error) {
      console.error("[TimesheetApprovals] Action error:", error);
      setError(
        error instanceof Error
          ? error.message
          : `Failed to ${action} timesheet. Please try again.`
      );
    } finally {
      setIsUpdating(false);
      setSelectedTimesheet(null);
      setAction(null);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-slate-900">
            Timesheet Approvals
          </h1>
          <p className="mt-2 text-sm text-slate-700">
            Review and approve employee timesheets.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex items-center gap-4">
          <WeekNavigation
            currentWeek={currentWeek}
            onWeekChange={(newWeek) => {
              router.push(`/admin/timesheets?week=${newWeek.toISOString()}`);
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | TimesheetStatus)
            }
            className="rounded-md border-slate-300 text-sm focus:border-slate-500 focus:ring-slate-500 text-slate-900"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-0"
                  >
                    Employee
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
                  >
                    Week
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
                  >
                    Projects
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
                  >
                    Total Hours
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
                  >
                    Status
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredTimesheets.length > 0 ? (
                  filteredTimesheets.map((week) => (
                    <tr key={week.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-0">
                        {week.user.full_name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                        {format(new Date(week.week_start_date), "MMM d")} -{" "}
                        {format(
                          addDays(new Date(week.week_start_date), 6),
                          "MMM d, yyyy"
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                        {week.timesheets
                          .map(
                            (t: TimesheetWithRelations) =>
                              t.project?.name || "Unknown Project"
                          )
                          .filter(
                            (value: string, index: number, self: string[]) =>
                              self.indexOf(value) === index
                          )
                          .join(", ")}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                        {week.total_hours}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                            week.status === "submitted"
                              ? "bg-yellow-50 text-yellow-700"
                              : week.status === "approved"
                              ? "bg-green-50 text-green-700"
                              : week.status === "rejected"
                              ? "bg-red-50 text-red-700"
                              : "bg-slate-50 text-slate-600"
                          }`}
                        >
                          {week.status.charAt(0).toUpperCase() +
                            week.status.slice(1)}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        <Link
                          href={`/admin/timesheets/${week.id}`}
                          className="text-slate-600 hover:text-slate-900"
                        >
                          Review
                          <span className="sr-only">
                            , {week.user.full_name}
                          </span>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-sm text-slate-500"
                    >
                      No timesheets found for this week
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setSelectedTimesheet(null);
          setAction(null);
        }}
        onConfirm={() => {
          if (selectedTimesheet && action) {
            handleAction(selectedTimesheet, action);
          }
        }}
        title={`${action?.charAt(0).toUpperCase()}${action?.slice(
          1
        )} Timesheet`}
        message={`Are you sure you want to ${action} this timesheet?`}
        isLoading={isUpdating}
      />

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
