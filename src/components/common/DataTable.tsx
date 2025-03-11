'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getPaginationRowModel,
  getFilteredRowModel,
  VisibilityState,
  FilterFn,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import LoadingSkeleton from './LoadingSkeleton';
import { LuSearch } from 'react-icons/lu';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading: boolean;
  filterPlaceholder?: string;
  defaultVisibility?: VisibilityState;
  showSearch?: boolean;
  showColumnToggle?: boolean;
  showPagination?: boolean;
  tableFooter?: React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  filterPlaceholder = 'Search all columns...',
  defaultVisibility = {},
  showSearch = true,
  showColumnToggle = true,
  showPagination = true,
  tableFooter,
  className = '',
  headerClassName = '',
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Set default column visibility
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>(defaultVisibility);

  // Define the filter function inside the component to access TData
  const globalFilterFn: FilterFn<TData> = (row, columnId, value) => {
    const searchableColumns = Object.keys(row.original as object).filter(
      (key) => {
        const val = (row.original as Record<string, unknown>)[key];
        return typeof val === 'string' || typeof val === 'number';
      },
    );

    // Check if any column contains the search value
    const matched = searchableColumns.some((column) => {
      const cellValue = (row.original as Record<string, unknown>)[column];
      if (cellValue == null) return false;

      return String(cellValue)
        .toLowerCase()
        .includes(String(value).toLowerCase());
    });

    return matched;
  };

  const table = useReactTable<TData>({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
  });

  // Helper function to format column ID for display
  const formatColumnName = (columnId: string) => {
    // Handle special cases like camelCase column IDs
    if (columnId === 'createdAt') return 'Created At';
    if (columnId === 'updatedAt') return 'Updated At';
    if (columnId === 'archivedAt') return 'Archived At';

    // Default formatting: capitalize first letter and add spaces before capital letters
    return columnId
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
  };

  return (
    <div className="w-full" data-testid="data-table">
      {(showSearch || showColumnToggle) && (
        <div className="flex items-center py-4">
          {showSearch && (
            <div className="relative max-w-sm">
              <LuSearch className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                data-testid="global-filter-input"
                placeholder={filterPlaceholder}
                value={globalFilter ?? ''}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="pl-8 max-w-sm"
              />
            </div>
          )}
          {showColumnToggle && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={showSearch ? 'ml-auto' : ''}
                  data-testid="columns-button"
                >
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        data-testid={`column-visibility-${column.id}`}
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {formatColumnName(column.id)}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
      {isLoading && <LoadingSkeleton />}
      {!isLoading && (
        <div className={className || 'rounded-md border'}>
          <Table>
            <TableHeader className={headerClassName || 'bg-slate-50'}>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} data-testid="table-header-row">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="text-slate-900 text-left"
                        data-testid={`table-header-cell-${header.column.id}`}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    data-testid={`table-row`}
                    className="bg-white hover:bg-slate-50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="text-slate-900 text-left"
                        data-testid={`table-cell-${cell.id.split('_')[1]}`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-left"
                    data-testid="no-results-cell"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            {tableFooter}
          </Table>
        </div>
      )}
      {showPagination && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            data-testid="table-previous-button"
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            data-testid="table-next-button"
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
