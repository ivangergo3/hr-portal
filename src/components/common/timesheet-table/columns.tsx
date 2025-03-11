import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LuTrash2 } from 'react-icons/lu';
import { TimesheetEntry, DAYS } from './types';
import { calculateEntryTotal } from './utils';

export const createColumns = (
  editable: boolean,
  onDeleteEntry?: (id: string) => void,
  onHoursChange?: (id: string, field: string, value: number) => void,
): ColumnDef<TimesheetEntry>[] => {
  const columns: ColumnDef<TimesheetEntry>[] = [
    // Client column
    {
      accessorKey: 'project.client.name',
      header: 'Client',
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.project.client?.name || 'N/A'}
        </div>
      ),
    },
    // Project column
    {
      accessorKey: 'project.name',
      header: 'Project',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.project.name}</div>
      ),
    },
  ];

  // Add day columns
  DAYS.forEach((day) => {
    columns.push({
      accessorKey: day.key,
      header: day.label,
      cell: ({ row }) => {
        const id = row.original.id;
        const value = row.original[day.key as keyof TimesheetEntry] as number;

        return (
          <div className="text-left font-medium">
            {editable ? (
              <Input
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={String(value)}
                onChange={(e) => {
                  const numValue = parseFloat(e.target.value) || 0;
                  if (onHoursChange) {
                    onHoursChange(id, day.key, numValue);
                  }
                }}
                className="w-16 h-8 text-center"
                data-testid={`edit-${day.key}-${id}`}
              />
            ) : (
              <span>{typeof value === 'number' ? `${value}h` : `${0}h`}</span>
            )}
          </div>
        );
      },
    });
  });

  // Add total column
  columns.push({
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => (
      <div className="text-left font-medium">
        {calculateEntryTotal(row.original)}h
      </div>
    ),
    accessorFn: (row) => calculateEntryTotal(row),
  });

  // Add actions column if editable
  if (editable && onDeleteEntry) {
    columns.push({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDeleteEntry(row.original.id)}
          className="text-red-500"
          data-testid={`delete-entry-${row.original.id}`}
        >
          <LuTrash2 className="h-4 w-4" />
        </Button>
      ),
    });
  }

  return columns;
};
