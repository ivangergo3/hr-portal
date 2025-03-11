'use client';

import { TimesheetWeekWithRelations } from '@/types/database.types';
import {
  TimesheetTable,
  TimesheetEntry,
} from '@/components/common/timesheet-table/TimesheetTable';

interface TimesheetApprovalReviewContentProps {
  timesheet: TimesheetWeekWithRelations | null;
  isLoading: boolean;
}

export function TimesheetApprovalReviewContent({
  timesheet,
  isLoading,
}: TimesheetApprovalReviewContentProps) {
  if (!timesheet || isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center text-sm text-slate-600">
          {isLoading ? 'Loading...' : 'No timesheet data available'}
        </div>
      </div>
    );
  }

  // Map the timesheets entries to the format expected by TimesheetTable
  const entries: TimesheetEntry[] = timesheet.timesheets.map((entry) => ({
    id: entry.id,
    monday_hours: entry.monday_hours,
    tuesday_hours: entry.tuesday_hours,
    wednesday_hours: entry.wednesday_hours,
    thursday_hours: entry.thursday_hours,
    friday_hours: entry.friday_hours,
    saturday_hours: entry.saturday_hours || 0,
    sunday_hours: entry.sunday_hours || 0,
    project: {
      id: entry.project.id,
      name: entry.project.name,
      client: entry.project.client,
    },
  }));

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <TimesheetTable entries={entries} isLoading={isLoading} />
    </div>
  );
}
