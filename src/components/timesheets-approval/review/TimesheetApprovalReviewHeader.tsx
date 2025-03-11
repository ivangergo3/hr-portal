'use client';

import { LuArrowLeft, LuCheck, LuX } from 'react-icons/lu';
import { TimesheetWeekWithRelations } from '@/types/database.types';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

interface TimesheetApprovalReviewHeaderProps {
  timesheet: TimesheetWeekWithRelations | null;
  onBack: () => void;
  onApprove: () => void;
  onReject: () => void;
  isLoading: boolean;
}

export function TimesheetApprovalReviewHeader({
  timesheet,
  onBack,
  onApprove,
  onReject,
  isLoading,
}: TimesheetApprovalReviewHeaderProps) {
  return (
    <div className="border-b border-slate-200 bg-white px-4 py-5 sm:px-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
        {/* Part 1: Title with back button */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mr-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-500"
            data-testid="timesheet-approval-review-back-button"
          >
            <LuArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-medium leading-6 text-slate-900">
            Timesheet Review
          </h1>
        </div>

        {/* Part 2: Status badge */}
        <div className="flex justify-center">
          {timesheet && (
            <span
              className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                timesheet.status === 'submitted'
                  ? 'bg-yellow-50 text-yellow-700'
                  : timesheet.status === 'approved'
                    ? 'bg-green-50 text-green-700'
                    : timesheet.status === 'rejected'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-slate-100 text-slate-700'
              }`}
              data-testid="timesheet-approval-review-header-status"
            >
              {timesheet.status.charAt(0).toUpperCase() +
                timesheet.status.slice(1)}
            </span>
          )}
        </div>

        {/* Part 3: Username and time */}
        <div className="text-sm text-slate-500 text-center">
          {timesheet && (
            <>
              <span className="font-medium text-slate-700">
                {timesheet.user.full_name}
              </span>
              <br />
              <span>
                Week starting{' '}
                {format(new Date(timesheet.week_start_date), 'MMMM d, yyyy')}
              </span>
            </>
          )}
        </div>

        {/* Part 4: Action buttons */}
        <div className="flex justify-end space-x-2">
          <>
            <Button
              onClick={onReject}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              disabled={isLoading || timesheet?.status !== 'submitted'}
              data-testid="timesheet-approval-review-reject-button"
            >
              <LuX className="mr-2 h-4 w-4 text-red-500" />
              Reject
            </Button>
            <Button
              onClick={onApprove}
              className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              disabled={isLoading || timesheet?.status !== 'submitted'}
              data-testid="timesheet-approval-review-approve-button"
            >
              <LuCheck className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </>
        </div>
      </div>
    </div>
  );
}
