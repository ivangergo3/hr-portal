'use client';

import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/common/DataTable';
import { TimesheetEntry, TimesheetTableProps } from './types';
import { createColumns } from './columns';
import { TimesheetTableFooter } from './footer';

export * from './types';

export function TimesheetTable({
  entries,
  isLoading = false,
  editable = false,
  projects = [],
  onAddEntry,
  onDeleteEntry,
  onUpdateEntry,
}: TimesheetTableProps) {
  const [localEntries, setLocalEntries] = useState<TimesheetEntry[]>(entries);
  const [pendingChanges, setPendingChanges] = useState<
    Record<string, Partial<TimesheetEntry>>
  >({});

  // Update local entries when props change
  useEffect(() => {
    setLocalEntries(entries);
  }, [entries]);

  // Handle hours change
  const handleHoursChange = (id: string, field: string, value: number) => {
    // Update the local entry for immediate UI feedback
    setLocalEntries((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry,
      ),
    );

    // Track the change for later submission
    setPendingChanges((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  // Submit all pending changes when save is triggered externally
  useEffect(() => {
    if (onUpdateEntry && Object.keys(pendingChanges).length > 0) {
      // Submit each change
      Object.entries(pendingChanges).forEach(([id, changes]) => {
        if (Object.keys(changes).length > 0) {
          onUpdateEntry(id, changes);
        }
      });

      // Clear pending changes after submission
      setPendingChanges({});
    }
  }, [onUpdateEntry, pendingChanges]);

  // Create columns with the ability to edit hours
  const columns = createColumns(editable, onDeleteEntry, handleHoursChange);

  return (
    <DataTable
      columns={columns}
      data={localEntries}
      isLoading={isLoading}
      filterPlaceholder=""
      defaultVisibility={{}}
      tableFooter={
        <TimesheetTableFooter
          entries={localEntries}
          editable={editable}
          projects={projects}
          onAddEntry={onAddEntry}
        />
      }
      showSearch={false}
      showColumnToggle={false}
      showPagination={false}
      className="border border-slate-200 rounded-lg overflow-hidden"
      headerClassName="bg-slate-50"
    />
  );
}
