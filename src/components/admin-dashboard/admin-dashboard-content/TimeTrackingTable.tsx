'use client';

import { DataTable } from '@/components/common/DataTable';
import { columns, TimeEntry } from './TimeTrackingColumns';

interface TimeTrackingTableProps {
  timeEntries: TimeEntry[];
  isLoading: boolean;
}

export function TimeTrackingTable({
  timeEntries,
  isLoading,
}: TimeTrackingTableProps) {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-lg font-medium text-slate-900">
          Time Tracking Details
        </h2>
      </div>
      <div className="p-6">
        <DataTable
          columns={columns}
          data={timeEntries}
          isLoading={isLoading}
          filterPlaceholder="Filter time entries..."
          defaultVisibility={{}}
        />
      </div>
    </div>
  );
}
