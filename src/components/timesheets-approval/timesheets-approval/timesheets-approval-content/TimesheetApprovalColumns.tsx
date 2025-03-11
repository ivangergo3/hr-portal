'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/common/DataTableColumnHeader';
import { format } from 'date-fns';
import { TimesheetApprovalActionCell } from './TimesheetApprovalActionCell';
import type { TimesheetStatus } from '@/types/database.types';

// Define the TimesheetResponse type
type TimesheetResponse = {
  id: string;
  week_start_date: string;
  status: TimesheetStatus;
  total_hours: number;
  user_id: string;
  updated_at: string;
  created_at: string;
  user: {
    id: string;
    full_name: string;
    email: string;
  };
};

// Function to create columns with dynamic props
export const createColumns = (
  onReview: (timesheet: TimesheetResponse) => void,
  onApprove: (timesheet: TimesheetResponse) => void,
  onReject: (timesheet: TimesheetResponse) => void,
): ColumnDef<TimesheetResponse>[] => [
  {
    accessorKey: 'user.full_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Employee" />
    ),
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div
          className="font-medium truncate max-w-[200px]"
          title={user.full_name || user.email}
        >
          {user.full_name || user.email}
        </div>
      );
    },
    size: 2, // Relative width (2 parts)
  },
  {
    accessorKey: 'user.email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div className="font-medium truncate max-w-[200px]" title={user.email}>
          {user.email}
        </div>
      );
    },
    size: 2, // Relative width (2 parts)
  },
  {
    accessorKey: 'week_start_date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Week" />
    ),
    cell: ({ row }) => {
      const startDate = row.getValue('week_start_date') as string;
      const formattedDate = format(new Date(startDate), 'MMM d, yyyy');
      return <div className="font-medium">{formattedDate}</div>;
    },
    sortingFn: (rowA, rowB) => {
      const dateA = new Date(rowA.getValue('week_start_date') as string);
      const dateB = new Date(rowB.getValue('week_start_date') as string);
      return dateA.getTime() - dateB.getTime();
    },
    size: 1, // Relative width (1 part)
  },
  {
    accessorKey: 'total_hours',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hours" />
    ),
    cell: ({ row }) => {
      const hours = row.getValue('total_hours') as number;
      return <div className="font-medium">{hours}</div>;
    },
    size: 1, // Relative width (1 part)
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <div className="font-medium">
          <span
            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
              status === 'submitted'
                ? 'bg-yellow-50 text-yellow-700'
                : status === 'approved'
                  ? 'bg-green-50 text-green-700'
                  : status === 'rejected'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-slate-100 text-slate-700'
            }`}
            data-testid={`timesheet-approval-status-${status}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    size: 1, // Relative width (1 part)
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created On" />
    ),
    cell: ({ row }) => {
      const createdAt = row.getValue('created_at') as string;
      const formattedDate = format(new Date(createdAt), 'MMM d, yyyy');
      return <div className="font-medium">{formattedDate}</div>;
    },
    sortingFn: (rowA, rowB) => {
      const dateA = new Date(rowA.getValue('created_at') as string);
      const dateB = new Date(rowB.getValue('created_at') as string);
      return dateA.getTime() - dateB.getTime();
    },
    size: 1, // Relative width (1 part)
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actions" />
    ),
    cell: ({ row }) => (
      <TimesheetApprovalActionCell
        row={row}
        onReview={onReview}
        onApprove={onApprove}
        onReject={onReject}
      />
    ),
    size: 0.5, // Relative width (0.5 part - narrower for actions)
  },
];
