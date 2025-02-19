'use client';

import { useState, useEffect } from 'react';
import {
  TimesheetWeekWithRelations,
  TimesheetStatus,
} from '@/types/database.types';
import { LuLoader } from 'react-icons/lu';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import EmptyState from '@/components/common/EmptyState';

interface TimesheetListProps {
  timesheets: TimesheetWeekWithRelations[];
}

export default function TimesheetList({ timesheets }: TimesheetListProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | TimesheetStatus>(
    'all',
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSkeleton rows={5} columns={4} />;
  }

  if (timesheets.length === 0) {
    return (
      <EmptyState
        title="No timesheets"
        message="No timesheets have been submitted yet."
      />
    );
  }

  const filteredTimesheets =
    statusFilter === 'all'
      ? timesheets
      : timesheets.filter((timesheet) => timesheet.status === statusFilter);

  return (
    <div className="mt-8 flow-root">
      <div className="mb-4 flex justify-end">
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as 'all' | TimesheetStatus)
          }
          className="rounded-md border-slate-300 text-sm focus:border-slate-500 focus:ring-slate-500"
          disabled={isLoading}
        >
          <option value="all">All Timesheets</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LuLoader className="h-8 w-8 animate-spin text-slate-500" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Week
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTimesheets.map((timesheet) => (
                <tr key={timesheet.id}>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {timesheet.week_start_date}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {timesheet.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
