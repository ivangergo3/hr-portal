import { LuArrowLeft, LuCheck, LuX } from "react-icons/lu";
import type { TimesheetWeekWithRelations } from "@/types/database.types";
import { format } from "date-fns";

interface TimesheetReviewHeaderProps {
  timesheet: TimesheetWeekWithRelations | null;
  onBack: () => void;
  onApprove: () => void;
  onReject: () => void;
  isLoading: boolean;
}

export function TimesheetReviewHeader({
  timesheet,
  onBack,
  onApprove,
  onReject,
  isLoading,
}: TimesheetReviewHeaderProps) {
  return (
    <div className="bg-white shadow">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="rounded-lg p-2 text-slate-400 hover:text-slate-500"
            >
              <LuArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Review Timesheet
              </h1>
              {timesheet && (
                <p className="mt-1 text-sm text-slate-600">
                  {timesheet.user.full_name} -{" "}
                  {format(new Date(timesheet.week_start_date), "MMM d, yyyy")}
                </p>
              )}
            </div>
          </div>
          {timesheet?.status === "submitted" && (
            <div className="flex items-center gap-3">
              <button
                onClick={onReject}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-red-600 hover:text-red-500"
              >
                <LuX className="h-4 w-4" />
                Reject
              </button>
              <button
                onClick={onApprove}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-500"
              >
                <LuCheck className="h-4 w-4" />
                Approve
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
