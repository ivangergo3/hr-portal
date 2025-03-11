'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/common/DataTableColumnHeader';
import { format } from 'date-fns';

// Define the TimeEntry interface
export interface TimeEntry {
  employee: string;
  project: string;
  client: string;
  date: string;
  hours: number;
}

// Function to create columns
export const createColumns = (): ColumnDef<TimeEntry>[] => [
  {
    accessorKey: 'employee',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Employee" />
    ),
    cell: ({ row }) => {
      return (
        <div
          className="font-medium truncate max-w-[200px]"
          title={row.getValue('employee')}
        >
          {row.getValue('employee')}
        </div>
      );
    },
    size: 3, // Relative width (3 parts)
  },
  {
    accessorKey: 'project',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Project" />
    ),
    cell: ({ row }) => {
      return (
        <div
          className="font-medium truncate max-w-[200px]"
          title={row.getValue('project')}
        >
          {row.getValue('project')}
        </div>
      );
    },
    size: 3, // Relative width (3 parts)
  },
  {
    accessorKey: 'client',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client" />
    ),
    cell: ({ row }) => {
      return (
        <div
          className="font-medium truncate max-w-[200px]"
          title={row.getValue('client')}
        >
          {row.getValue('client')}
        </div>
      );
    },
    size: 3, // Relative width (3 parts)
  },
  {
    accessorKey: 'date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('date') as string;
      const formattedDate = format(new Date(date), 'MMM d, yyyy');
      return <div className="font-medium">{formattedDate}</div>;
    },
    sortingFn: (rowA, rowB) => {
      const dateA = new Date(rowA.getValue('date'));
      const dateB = new Date(rowB.getValue('date'));
      return dateA.getTime() - dateB.getTime();
    },
    size: 2, // Relative width (2 parts)
  },
  {
    accessorKey: 'hours',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hours" />
    ),
    cell: ({ row }) => {
      const hours = row.getValue('hours') as number;
      return <div className="font-medium">{hours}</div>;
    },
    size: 1, // Relative width (1 part)
  },
];

// Export a default columns array
export const columns: ColumnDef<TimeEntry>[] = createColumns();
