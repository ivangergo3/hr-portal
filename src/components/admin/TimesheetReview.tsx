"use client";

import { TimesheetWeekWithRelations } from "@/types/database.types";

interface TimesheetReviewProps {
  timesheet: TimesheetWeekWithRelations | null;
  isLoading: boolean;
}

export default function TimesheetReview({
  timesheet,
  isLoading,
}: TimesheetReviewProps) {
  if (!timesheet || isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center text-sm text-slate-600">
          {isLoading ? "Loading..." : "No timesheet data available"}
        </div>
      </div>
    );
  }

  const calculateDailyTotal = (day: string) => {
    return timesheet.timesheets.reduce(
      (total, entry) =>
        total + ((entry[`${day}_hours` as keyof typeof entry] as number) || 0),
      0
    );
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="overflow-hidden rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
              >
                Project
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
              >
                Client
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-center text-sm font-semibold text-slate-900"
              >
                Mon
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-center text-sm font-semibold text-slate-900"
              >
                Tue
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-center text-sm font-semibold text-slate-900"
              >
                Wed
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-center text-sm font-semibold text-slate-900"
              >
                Thu
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-center text-sm font-semibold text-slate-900"
              >
                Fri
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-center text-sm font-semibold text-slate-900"
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {timesheet.timesheets.map((entry) => (
              <tr key={entry.id}>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                  {entry.project.name}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                  {entry.project.client.name}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-center text-sm text-slate-500">
                  {entry.monday_hours}h
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-center text-sm text-slate-500">
                  {entry.tuesday_hours}h
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-center text-sm text-slate-500">
                  {entry.wednesday_hours}h
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-center text-sm text-slate-500">
                  {entry.thursday_hours}h
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-center text-sm text-slate-500">
                  {entry.friday_hours}h
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-center text-sm font-medium text-slate-900">
                  {entry.monday_hours +
                    entry.tuesday_hours +
                    entry.wednesday_hours +
                    entry.thursday_hours +
                    entry.friday_hours}
                  h
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50">
            <tr>
              <td
                colSpan={2}
                className="px-3 py-4 text-sm font-medium text-slate-900"
              >
                Daily Total
              </td>
              <td className="px-3 py-4 text-center text-sm font-medium text-slate-900">
                {calculateDailyTotal("monday")}h
              </td>
              <td className="px-3 py-4 text-center text-sm font-medium text-slate-900">
                {calculateDailyTotal("tuesday")}h
              </td>
              <td className="px-3 py-4 text-center text-sm font-medium text-slate-900">
                {calculateDailyTotal("wednesday")}h
              </td>
              <td className="px-3 py-4 text-center text-sm font-medium text-slate-900">
                {calculateDailyTotal("thursday")}h
              </td>
              <td className="px-3 py-4 text-center text-sm font-medium text-slate-900">
                {calculateDailyTotal("friday")}h
              </td>
              <td className="px-3 py-4 text-center text-sm font-medium text-slate-900">
                {timesheet.total_hours}h
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
