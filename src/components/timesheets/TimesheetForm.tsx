'use client';

import React, { useState } from 'react';
import type { User, Project, Timesheet } from '@/types/database.types';
import type { PostgrestError } from '@supabase/supabase-js';
import { LuLoader, LuSave, LuSend, LuX } from 'react-icons/lu';
import Notification from '@/components/common/Notification';
import { createClient } from '@/utils/supabase/client';

type TimesheetFormProps = {
  user: User;
  projects: Project[];
  weekStart: Date;
  weekStatus: string;
  initialTimesheets?: Timesheet[];
  onSave?: () => void;
  onCancel?: () => void;
};

const DAYS = [
  { short: 'Mon', full: 'monday' },
  { short: 'Tue', full: 'tuesday' },
  { short: 'Wed', full: 'wednesday' },
  { short: 'Thu', full: 'thursday' },
  { short: 'Fri', full: 'friday' },
  { short: 'Sat', full: 'saturday' },
  { short: 'Sun', full: 'sunday' },
];

type ProjectEntry = {
  project_id: string;
  hours: Record<string, number>;
};

export function TimesheetForm({
  user,
  projects,
  weekStart,
  weekStatus,
  initialTimesheets = [],
  onSave,
  onCancel,
}: TimesheetFormProps) {
  const [projectEntries, setProjectEntries] = useState<ProjectEntry[]>(() => {
    // Convert initial timesheets to project entries
    const entries: Record<string, ProjectEntry> = {};

    initialTimesheets.forEach((timesheet) => {
      if (!entries[timesheet.project_id]) {
        entries[timesheet.project_id] = {
          project_id: timesheet.project_id,
          hours: {},
        };
      }

      DAYS.forEach(({ full }) => {
        entries[timesheet.project_id].hours[full] = timesheet[
          `${full}_hours` as keyof typeof timesheet
        ] as number;
      });
    });

    return Object.values(entries);
  });
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const supabase = createClient();

  const calculateProjectTotal = (projectId: string) => {
    const entry = projectEntries.find((e) => e.project_id === projectId);
    const total = DAYS.reduce((total, { full }) => {
      const hours = entry?.hours[full] || 0;
      return total + hours;
    }, 0);
    return total;
  };

  const calculateDayTotal = (day: string) => {
    const total = projectEntries.reduce((total, entry) => {
      const hours = entry.hours[day] || 0;
      return total + hours;
    }, 0);
    return total;
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (projectEntries.length === 0) {
      errors.projects = 'At least one project must be selected';
    }

    const totalHours = DAYS.reduce((total, { full }) => {
      return total + calculateDayTotal(full);
    }, 0);

    if (totalHours === 0) {
      errors.hours = 'Total hours must be greater than 0';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (
    e: React.FormEvent,
    status: 'draft' | 'submitted',
  ) => {
    e.preventDefault();

    if (status === 'submitted' && !validateForm()) {
      setError('Please fix the validation errors before submitting');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Check for existing timesheet week
      const { data: existingWeek } = await supabase
        .from('timesheet_weeks')
        .select('id')
        .eq('user_id', user.id)
        .eq('week_start_date', weekStart.toISOString())
        .single();

      // Update or create timesheet week
      const { data: weekData, error: weekError } = await supabase
        .from('timesheet_weeks')
        [existingWeek ? 'update' : 'insert'](
          existingWeek
            ? {
                user_id: user.id,
                week_start_date: weekStart.toISOString(),
                status,
                total_hours: projectEntries.reduce(
                  (total, entry) =>
                    total +
                    Object.values(entry.hours).reduce(
                      (sum, h) => sum + (h || 0),
                      0,
                    ),
                  0,
                ),
              }
            : [
                {
                  user_id: user.id,
                  week_start_date: weekStart.toISOString(),
                  status,
                  total_hours: projectEntries.reduce(
                    (total, entry) =>
                      total +
                      Object.values(entry.hours).reduce(
                        (sum, h) => sum + (h || 0),
                        0,
                      ),
                    0,
                  ),
                },
              ],
        )
        .eq(existingWeek ? 'id' : '', existingWeek?.id || '')
        .select()
        .single();

      if (weekError) throw weekError;

      // Delete existing timesheet entries if updating
      if (existingWeek) {
        await supabase
          .from('timesheets')
          .delete()
          .eq('week_id', existingWeek.id);
      }

      // Create new timesheet entries
      const timesheetData = projectEntries.map((entry) => ({
        week_id: weekData.id,
        client_id: projects.find((p) => p.id === entry.project_id)?.client_id,
        project_id: entry.project_id,
        user_id: user.id,
        week_start_date: weekStart.toISOString(),
        monday_hours: Number(entry.hours.monday || 0),
        tuesday_hours: Number(entry.hours.tuesday || 0),
        wednesday_hours: Number(entry.hours.wednesday || 0),
        thursday_hours: Number(entry.hours.thursday || 0),
        friday_hours: Number(entry.hours.friday || 0),
        saturday_hours: Number(entry.hours.saturday || 0),
        sunday_hours: Number(entry.hours.sunday || 0),
      }));

      const { error: timesheetError } = await supabase
        .from('timesheets')
        .insert(timesheetData);

      if (timesheetError) throw timesheetError;

      setNotification({
        message: `Timesheet ${
          status === 'submitted' ? 'submitted' : 'saved'
        } successfully`,
        type: 'success',
      });

      onSave?.();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('[TimesheetForm] Error:', error.message);
      } else if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        'message' in error
      ) {
        const dbError = error as PostgrestError;
        console.error('[TimesheetForm] Database error:', {
          code: dbError.code,
          message: dbError.message,
        });
      } else {
        console.error('[TimesheetForm] Unknown error:', error);
      }
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addProjectRow = () => {
    if (
      !selectedProject ||
      projectEntries.some((entry) => entry.project_id === selectedProject)
    ) {
      return;
    }
    setProjectEntries([
      ...projectEntries,
      {
        project_id: selectedProject,
        hours: DAYS.reduce((acc, { full }) => ({ ...acc, [full]: 0 }), {}),
      },
    ]);
    setSelectedProject('');
  };

  const removeProjectRow = (projectId: string) => {
    setProjectEntries(
      projectEntries.filter((entry) => entry.project_id !== projectId),
    );
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="block w-64 rounded-md border-slate-300 shadow-sm 
              focus:border-slate-500 focus:ring-slate-500 text-sm text-slate-900"
          >
            <option value="">Select a project...</option>
            {projects
              .filter(
                (p) =>
                  !projectEntries.some((entry) => entry.project_id === p.id),
              )
              .map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} ({project.client?.name})
                </option>
              ))}
          </select>
          <button
            type="button"
            onClick={addProjectRow}
            disabled={!selectedProject}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-800 
              rounded-md hover:bg-slate-700 disabled:opacity-50"
          >
            Add Project
          </button>
          <span
            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
              weekStatus === 'submitted'
                ? 'bg-yellow-50 text-yellow-700'
                : weekStatus === 'approved'
                  ? 'bg-green-50 text-green-700'
                  : weekStatus === 'rejected'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-slate-100 text-slate-700'
            }`}
          >
            {weekStatus || 'draft'}
          </span>
          <div className="flex-1" />
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="rounded-md px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'draft')}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-200"
          >
            <LuSave className="h-4 w-4" />
            Save Draft
          </button>
          <button
            type="submit"
            onClick={(e) => handleSubmit(e, 'submitted')}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <LuLoader className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <LuSend className="h-4 w-4" />
                Submit
              </>
            )}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-slate-200 bg-white rounded-lg">
            <thead className="bg-slate-50">
              <tr>
                <th className="py-4 px-6 text-left text-sm font-semibold text-slate-900 w-64">
                  Project
                </th>
                {DAYS.map(({ short }) => (
                  <th
                    key={short}
                    className="py-4 px-4 text-center text-sm font-semibold text-slate-900"
                  >
                    {short}
                  </th>
                ))}
                <th className="py-4 px-4 text-center text-sm font-semibold text-slate-900">
                  Total
                </th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {projectEntries.map((entry) => {
                const project = projects.find(
                  (p) => p.id === entry.project_id,
                )!;
                return (
                  <tr key={project.id} className="hover:bg-slate-50">
                    <td className="py-4 px-6 text-sm">
                      <div className="font-medium text-slate-900">
                        {project.name}
                      </div>
                      <div className="text-slate-500 text-xs mt-1">
                        {project.client?.name}
                      </div>
                    </td>
                    {DAYS.map(({ full }) => (
                      <td key={full} className="py-4 px-4 text-center">
                        <input
                          type="number"
                          min="0"
                          max="24"
                          step="0.5"
                          value={entry.hours[full] || 0}
                          onChange={(e) =>
                            setProjectEntries(
                              projectEntries.map((entry) =>
                                entry.project_id === project.id
                                  ? {
                                      ...entry,
                                      hours: {
                                        ...entry.hours,
                                        [full]: parseFloat(e.target.value),
                                      },
                                    }
                                  : entry,
                              ),
                            )
                          }
                          className="w-16 text-center rounded-md border-slate-300 shadow-sm 
                            focus:border-slate-500 focus:ring-slate-500 text-sm text-slate-900"
                        />
                      </td>
                    ))}
                    <td className="py-4 px-4 text-center text-sm font-medium text-slate-900">
                      {calculateProjectTotal(project.id)}h
                    </td>
                    <td className="py-4 px-2">
                      <button
                        type="button"
                        onClick={() => removeProjectRow(project.id)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <LuX className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50 border-t-2 border-slate-200">
              <tr>
                <td className="py-4 px-6 text-sm font-medium text-slate-900">
                  Weekly Total
                </td>
                {DAYS.map(({ full }) => (
                  <td
                    key={full}
                    className="py-4 px-4 text-center text-sm font-medium text-slate-900"
                  >
                    {calculateDayTotal(full)}h
                  </td>
                ))}
                <td className="py-4 px-4 text-center text-sm font-medium text-slate-900">
                  {(() => {
                    // Calculate total by summing up all day totals
                    const total = DAYS.reduce((total, { full }) => {
                      return total + calculateDayTotal(full);
                    }, 0);
                    return `${total}h`;
                  })()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {Object.keys(fieldErrors).length > 0 && (
        <div className="rounded-md bg-yellow-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Please fix the following errors:
              </h3>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                {Object.values(fieldErrors).map((err, i) => (
                  <li key={i} className="text-sm text-yellow-700">
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
