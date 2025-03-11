'use client';

import { ColumnDef } from '@tanstack/react-table';
import { TimeOffRequestWithUser } from '@/types/database.types';
import { DataTableColumnHeader } from '@/components/common/DataTableColumnHeader';
import { format } from 'date-fns';

// Export the columns array directly
export const columns: ColumnDef<TimeOffRequestWithUser>[] = [
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const type = row.getValue('type') as string;
      return (
        <div className="font-medium truncate max-w-[150px]" title={type}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </div>
      );
    },
    size: 1, // Relative width (1 part)
  },
  {
    accessorKey: 'start_date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Start Date" />
    ),
    cell: ({ row }) => {
      const startDate = row.getValue('start_date') as string;
      const formattedDate = format(new Date(startDate), 'MMM d, yyyy');
      return <div className="font-medium">{formattedDate}</div>;
    },
    sortingFn: (rowA, rowB) => {
      const dateA = new Date(rowA.getValue('start_date') as string);
      const dateB = new Date(rowB.getValue('start_date') as string);
      return dateA.getTime() - dateB.getTime();
    },
    size: 1, // Relative width (1 part)
  },
  {
    accessorKey: 'end_date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="End Date" />
    ),
    cell: ({ row }) => {
      const endDate = row.getValue('end_date') as string;
      const formattedDate = format(new Date(endDate), 'MMM d, yyyy');
      return <div className="font-medium">{formattedDate}</div>;
    },
    sortingFn: (rowA, rowB) => {
      const dateA = new Date(rowA.getValue('end_date') as string);
      const dateB = new Date(rowB.getValue('end_date') as string);
      return dateA.getTime() - dateB.getTime();
    },
    size: 1, // Relative width (1 part)
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => {
      const description = row.getValue('description') as string;
      return (
        <div className="font-medium truncate max-w-[300px]" title={description}>
          {description || 'N/A'}
        </div>
      );
    },
    size: 2, // Relative width (2 parts)
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
      <DataTableColumnHeader column={column} title="Requested On" />
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
];
