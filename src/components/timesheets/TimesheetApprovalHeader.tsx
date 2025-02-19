import { format, endOfWeek, addWeeks, subWeeks } from "date-fns";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

interface TimesheetApprovalHeaderProps {
  selectedWeek: Date;
  onWeekChange: (date: Date) => void;
}

export function TimesheetApprovalHeader({
  selectedWeek,
  onWeekChange,
}: TimesheetApprovalHeaderProps) {
  return (
    <div className="bg-white shadow">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Timesheet Approvals
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Review and manage timesheet submissions
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onWeekChange(subWeeks(selectedWeek, 1))}
                className="rounded-lg p-2 text-slate-400 hover:text-slate-500"
              >
                <LuChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm font-medium text-slate-900">
                {format(selectedWeek, "MMM d")} -{" "}
                {format(
                  endOfWeek(selectedWeek, { weekStartsOn: 1 }),
                  "MMM d, yyyy"
                )}
              </span>
              <button
                onClick={() => onWeekChange(addWeeks(selectedWeek, 1))}
                className="rounded-lg p-2 text-slate-400 hover:text-slate-500"
              >
                <LuChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
