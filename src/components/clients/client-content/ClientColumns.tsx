'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Client } from '@/types/database.types';
import { DataTableColumnHeader } from '@/components/common/DataTableColumnHeader';
import { ActionCell } from './ClientArchiveCell';

// Function to create columns with dynamic props
export const createColumns = (
  showArchived: boolean,
  refreshData: () => void,
): ColumnDef<Client>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      return (
        <div
          className="font-medium truncate max-w-[200px]"
          title={row.getValue('name')}
        >
          {row.getValue('name')}
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const nameA = rowA.original.name.toLowerCase();
      const nameB = rowB.original.name.toLowerCase();
      return nameA.localeCompare(nameB);
    },
    size: 3, // Relative width (3 parts)
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => {
      const createdAt = row.original.created_at;
      const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      return <div className="font-medium">{formattedDate}</div>;
    },
    sortingFn: (rowA, rowB) => {
      const dateA = new Date(rowA.original.created_at);
      const dateB = new Date(rowB.original.created_at);
      return dateA.getTime() - dateB.getTime();
    },
    size: 2, // Relative width (2 parts)
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated At" />
    ),
    cell: ({ row }) => {
      const updatedAt = row.original.updated_at;
      const formattedDate = new Date(updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      return <div className="font-medium">{formattedDate}</div>;
    },
    sortingFn: (rowA, rowB) => {
      const dateA = new Date(rowA.original.updated_at);
      const dateB = new Date(rowB.original.updated_at);
      return dateA.getTime() - dateB.getTime();
    },
    size: 2, // Relative width (2 parts)
  },
  {
    accessorKey: 'archived',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Archived" />
    ),
    cell: ({ row }) => {
      const archived = row.original.archived;
      return <div className="font-medium">{archived ? 'Yes' : 'No'}</div>;
    },
    sortingFn: (rowA) => {
      const archivedA = rowA.original.archived;
      return archivedA ? 1 : -1;
    },
    size: 1, // Relative width (1 part)
  },
  {
    accessorKey: 'archivedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Archived At" />
    ),
    cell: ({ row }) => {
      const archivedAt = row.original.archived_at;
      if (!archivedAt) {
        return <div className="font-medium">N/A</div>;
      }
      const formattedDate = new Date(archivedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      return <div className="font-medium">{formattedDate}</div>;
    },
    sortingFn: (rowA, rowB) => {
      if (!rowA.original.archived_at || !rowB.original.archived_at) {
        return 0;
      }
      const dateA = new Date(rowA.original.archived_at);
      const dateB = new Date(rowB.original.archived_at);
      return dateA.getTime() - dateB.getTime();
    },
    size: 2, // Relative width (2 parts)
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actions" />
    ),
    cell: ({ row }) => (
      <ActionCell
        row={row}
        showArchived={showArchived}
        onSuccess={refreshData}
      />
    ),
    size: 0.5, // Relative width (0.5 part - narrower for actions)
  },
];

// Export a default columns array for backward compatibility
export const columns: ColumnDef<Client>[] = createColumns(false, () => {});
