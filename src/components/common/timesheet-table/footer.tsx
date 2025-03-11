import React, { useState, useMemo } from 'react';
import { TableFooter, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { LuPlus } from 'react-icons/lu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TimesheetEntry, DAYS } from './types';
import { calculateDailyTotal, calculateGrandTotal } from './utils';

interface TimesheetTableFooterProps {
  entries: TimesheetEntry[];
  editable: boolean;
  projects: Array<{
    id: string;
    name: string;
    clients?: {
      id: string;
      name: string;
    };
  }>;
  onAddEntry?: (entry: Omit<TimesheetEntry, 'id'>) => void;
}

export function TimesheetTableFooter({
  entries,
  editable,
  projects,
  onAddEntry,
}: TimesheetTableFooterProps) {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // Extract unique clients from projects
  const clients = useMemo(() => {
    const uniqueClients = new Map();

    projects.forEach((project) => {
      if (project.clients) {
        uniqueClients.set(project.clients.id, project.clients);
      }
    });

    return Array.from(uniqueClients.values());
  }, [projects]);

  // Filter projects by selected client
  const filteredProjects = useMemo(() => {
    if (!selectedClientId) return [];
    return projects.filter(
      (project) => project.clients && project.clients.id === selectedClientId,
    );
  }, [projects, selectedClientId]);

  // Reset project selection when client changes
  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    setSelectedProjectId('');
  };

  // Handle adding a new entry
  const handleAddEntry = () => {
    if (!selectedProjectId || !onAddEntry) return;

    const selectedProject = projects.find((p) => p.id === selectedProjectId);
    if (!selectedProject) return;

    const newEntry: Omit<TimesheetEntry, 'id'> = {
      monday_hours: 0,
      tuesday_hours: 0,
      wednesday_hours: 0,
      thursday_hours: 0,
      friday_hours: 0,
      saturday_hours: 0,
      sunday_hours: 0,
      project: {
        id: selectedProject.id,
        name: selectedProject.name,
        client: selectedProject.clients,
      },
    };

    onAddEntry(newEntry);
    setSelectedProjectId('');
  };

  return (
    <TableFooter className="bg-slate-50">
      {editable && projects.length > 0 && onAddEntry && (
        <TableRow>
          <TableCell className="px-3 py-4">
            <Select value={selectedClientId} onValueChange={handleClientChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TableCell>
          <TableCell className="px-3 py-4">
            <Select
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
              disabled={!selectedClientId}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    selectedClientId ? 'Select Project' : 'Select Client First'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {filteredProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TableCell>
          <TableCell colSpan={8} className="px-3 py-4 text-center">
            <span className="text-sm text-slate-500">
              Hours will be editable after adding the entry
            </span>
          </TableCell>
          <TableCell className="px-3 py-4 text-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleAddEntry}
              disabled={!selectedProjectId}
              className="text-green-500 hover:text-green-700 hover:bg-green-50"
              data-testid="add-new-entry"
            >
              <LuPlus className="h-4 w-4" />
            </Button>
          </TableCell>
        </TableRow>
      )}
      <TableRow>
        <TableCell
          colSpan={2}
          className="px-3 py-4 text-sm font-medium text-slate-900"
        >
          Daily Total
        </TableCell>
        {DAYS.map((day) => (
          <TableCell
            key={day.key}
            className="px-3 py-4 text-left text-sm font-medium text-slate-900"
          >
            {calculateDailyTotal(entries, day.key.split('_')[0])}h
          </TableCell>
        ))}
        <TableCell className="px-3 py-4 text-left text-sm font-medium text-slate-900">
          {calculateGrandTotal(entries)}h
        </TableCell>
        {editable && <TableCell className="px-3 py-4" />}
      </TableRow>
    </TableFooter>
  );
}
