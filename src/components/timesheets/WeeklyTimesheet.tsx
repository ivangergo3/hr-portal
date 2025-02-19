"use client";

import {
  Project,
  Client,
  Timesheet,
  TimesheetStatus,
} from "@/types/database.types";
import { useState, useEffect } from "react";
import { addDays, format, startOfWeek } from "date-fns";
import { LuSave, LuSend, LuTrash } from "react-icons/lu";
import Notification from "@/components/common/Notification";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

interface WeeklyTimesheetProps {
  userId: string;
  initialTimesheets: TimesheetWithRelations[];
  projects: (Project & { client: Client })[];
  weekStart: Date;
  weekStatus: TimesheetStatus;
}

interface TimesheetWithRelations extends Timesheet {
  monday_hours: number;
  tuesday_hours: number;
  wednesday_hours: number;
  thursday_hours: number;
  friday_hours: number;
  saturday_hours: number;
  sunday_hours: number;
}

interface TimesheetEntry {
  project_id: string;
  hours: { [key: string]: number };
}

export default function WeeklyTimesheet({
  userId,
  initialTimesheets,
  projects,
  weekStart,
  weekStatus,
}: WeeklyTimesheetProps) {
  // Update the initialization of entries
  const [entries, setEntries] = useState<TimesheetEntry[]>(() => {
    // If there are no timesheets, return empty array
    if (!initialTimesheets.length) return [];

    // Map the timesheets to entries format
    return initialTimesheets.map((timesheet) => ({
      project_id: timesheet.project_id,
      hours: {
        [addDays(weekStart, 0).toISOString()]: timesheet.monday_hours || 0,
        [addDays(weekStart, 1).toISOString()]: timesheet.tuesday_hours || 0,
        [addDays(weekStart, 2).toISOString()]: timesheet.wednesday_hours || 0,
        [addDays(weekStart, 3).toISOString()]: timesheet.thursday_hours || 0,
        [addDays(weekStart, 4).toISOString()]: timesheet.friday_hours || 0,
        [addDays(weekStart, 5).toISOString()]: timesheet.saturday_hours || 0,
        [addDays(weekStart, 6).toISOString()]: timesheet.sunday_hours || 0,
      },
    }));
  });

  // Remove or modify the useEffect that resets entries
  // Instead, update entries when initialTimesheets changes
  useEffect(() => {
    if (!initialTimesheets.length) {
      setEntries([]);
      return;
    }

    setEntries(
      initialTimesheets.map((timesheet) => ({
        project_id: timesheet.project_id,
        hours: {
          [addDays(weekStart, 0).toISOString()]: timesheet.monday_hours || 0,
          [addDays(weekStart, 1).toISOString()]: timesheet.tuesday_hours || 0,
          [addDays(weekStart, 2).toISOString()]: timesheet.wednesday_hours || 0,
          [addDays(weekStart, 3).toISOString()]: timesheet.thursday_hours || 0,
          [addDays(weekStart, 4).toISOString()]: timesheet.friday_hours || 0,
          [addDays(weekStart, 5).toISOString()]: timesheet.saturday_hours || 0,
          [addDays(weekStart, 6).toISOString()]: timesheet.sunday_hours || 0,
        },
      }))
    );
  }, [initialTimesheets, weekStart]);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const supabase = createClient();

  // Generate weekdays
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Check if timesheet is editable
  const isEditable = weekStatus === "draft" || weekStatus === "rejected";

  // Disable submit button if already submitted or approved
  const canSubmit = weekStatus === "draft" || weekStatus === "rejected";

  const handleHoursChange = (
    projectId: string,
    date: string,
    hours: number
  ) => {
    if (!isEditable) return;
    setEntries((current) => {
      const projectEntry = current.find((e) => e.project_id === projectId);
      if (projectEntry) {
        return current.map((entry) =>
          entry.project_id === projectId
            ? {
                ...entry,
                hours: { ...entry.hours, [date]: hours },
              }
            : entry
        );
      }
      return [...current, { project_id: projectId, hours: { [date]: hours } }];
    });
  };

  const addProjectRow = () => {
    setEntries((current) => [...current, { project_id: "", hours: {} }]);
  };

  const removeRow = (indexToRemove: number) => {
    setEntries((current) => current.filter((_, i) => i !== indexToRemove));
  };

  // Add validation function
  const validateTimesheet = () => {
    if (entries.length === 0) {
      return null;
    }

    const invalidEntry = entries.find((entry) => !entry.project_id);
    if (invalidEntry) {
      return "Please select a project for all rows";
    }

    const hasHours = entries.some((entry) =>
      Object.values(entry.hours).some((hours) => hours > 0)
    );
    if (!hasHours) {
      return "Please enter hours for at least one day";
    }

    return null;
  };

  // Update the submit handler
  const handleSubmit = () => {
    const error = validateTimesheet();
    if (error) {
      setError(error);
      return;
    }
    setShowConfirmSubmit(true);
  };

  // Update the save function to validate before saving
  const saveTimesheets = async (status: "draft" | "submitted" = "draft") => {
    setIsSaving(true);
    setError("");

    try {
      const weekStartDate = startOfWeek(weekStart, {
        weekStartsOn: 1,
      }).toISOString();

      const { data: weekData, error: weekError } = await supabase
        .from("timesheet_weeks")
        .upsert(
          {
            user_id: userId,
            week_start_date: weekStartDate,
            status: status,
          },
          {
            onConflict: "user_id,week_start_date",
            ignoreDuplicates: false,
          }
        )
        .select()
        .single();

      if (weekError) {
        console.error("Weekly timesheet error:", weekError);
        throw new Error(weekError.message || "Failed to save weekly timesheet");
      }

      const { error: deleteError } = await supabase
        .from("timesheets")
        .delete()
        .eq("week_id", weekData.id);

      if (deleteError) {
        throw new Error(
          deleteError.message || "Failed to clear existing entries"
        );
      }

      const timesheetEntries = entries.map((entry) => {
        const project = projects.find((p) => p.id === entry.project_id);
        if (!project) {
          throw new Error(`Project not found: ${entry.project_id}`);
        }

        return {
          week_id: weekData.id,
          user_id: userId,
          project_id: entry.project_id,
          client_id: project.client.id,
          week_start_date: weekStartDate,
          monday_hours: entry.hours[addDays(weekStart, 0).toISOString()] || 0,
          tuesday_hours: entry.hours[addDays(weekStart, 1).toISOString()] || 0,
          wednesday_hours:
            entry.hours[addDays(weekStart, 2).toISOString()] || 0,
          thursday_hours: entry.hours[addDays(weekStart, 3).toISOString()] || 0,
          friday_hours: entry.hours[addDays(weekStart, 4).toISOString()] || 0,
          saturday_hours: entry.hours[addDays(weekStart, 5).toISOString()] || 0,
          sunday_hours: entry.hours[addDays(weekStart, 6).toISOString()] || 0,
          status: status,
        };
      });

      const { error: timesheetError } = await supabase
        .from("timesheets")
        .insert(timesheetEntries);

      if (timesheetError) throw timesheetError;

      setNotification({
        message:
          status === "submitted"
            ? entries.length === 0
              ? "Empty timesheet submitted successfully"
              : "Timesheet submitted successfully"
            : "Draft saved successfully",
        type: "success",
      });

      // Refresh the page to sync state
      if (status === "submitted") {
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error("10. Error saving timesheets:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to save timesheets. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Add state for confirmation dialog
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  return (
    <div className="space-y-6">
      {!isEditable && (
        <div className="rounded-md bg-slate-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-slate-800">
                {weekStatus === "submitted"
                  ? "Timesheet is pending approval"
                  : weekStatus === "approved"
                  ? "Timesheet has been approved"
                  : "Timesheet has been rejected"}
              </h3>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="w-80 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900">
                Project
              </th>
              {weekDays.map((day) => (
                <th
                  key={day.toISOString()}
                  className="w-32 px-3 py-3.5 text-center text-sm font-semibold text-slate-900"
                >
                  {format(day, "EEE dd")}
                </th>
              ))}
              <th className="w-28 py-3.5 pl-3 pr-4 text-right text-sm font-semibold text-slate-900">
                Total
              </th>
              <th className="w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {entries.map((entry, index) => (
              <tr key={entry.project_id || index}>
                <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm">
                  <select
                    value={entry.project_id}
                    onChange={(e) => {
                      const newProjectId = e.target.value;
                      const isProjectAlreadySelected = entries.some(
                        (existingEntry, i) =>
                          i !== index &&
                          existingEntry.project_id === newProjectId
                      );
                      if (isProjectAlreadySelected) {
                        setError(
                          "This project is already selected in another row"
                        );
                        return;
                      }
                      setError("");
                      setEntries((current) =>
                        current.map((c, i) =>
                          i === index ? { ...c, project_id: newProjectId } : c
                        )
                      );
                    }}
                    className={cn(
                      "block w-full rounded-md border-slate-300 text-sm focus:border-slate-500 focus:ring-slate-500 text-slate-900",
                      !isEditable && "bg-slate-50 text-slate-500",
                      !entry.project_id && "text-slate-900"
                    )}
                  >
                    <option value="" className="text-slate-900">
                      Select project
                    </option>
                    {projects
                      .filter(
                        (project) =>
                          project.id === entry.project_id ||
                          !entries.some((e) => e.project_id === project.id)
                      )
                      .map((project) => (
                        <option
                          key={project.id}
                          value={project.id}
                          className="text-slate-900"
                        >
                          {project.client.name} - {project.name}
                        </option>
                      ))}
                  </select>
                </td>
                {weekDays.map((day) => (
                  <td
                    key={day.toISOString()}
                    className="whitespace-nowrap px-3 py-2 text-sm text-center text-slate-900"
                  >
                    <input
                      type="number"
                      value={entry.hours[day.toISOString()] || ""}
                      onChange={(e) =>
                        handleHoursChange(
                          entry.project_id,
                          day.toISOString(),
                          parseFloat(e.target.value) || 0
                        )
                      }
                      disabled={!isEditable}
                      className={cn(
                        "w-20 text-center rounded-md border-slate-300 text-sm focus:border-slate-500 focus:ring-slate-500",
                        !isEditable && "bg-slate-50 text-slate-500"
                      )}
                      min="0"
                      max="24"
                      step="0.5"
                    />
                  </td>
                ))}
                <td className="whitespace-nowrap py-2 pl-3 pr-4 text-sm text-right font-medium text-slate-900">
                  <span className="w-28 inline-block text-right">
                    {Object.values(entry.hours)
                      .reduce((a, b) => a + (Number(b) || 0), 0)
                      .toFixed(1)}
                  </span>
                </td>
                <td className="whitespace-nowrap py-2 pl-3 pr-4 text-center">
                  <button
                    onClick={() => removeRow(index)}
                    className="text-slate-400 hover:text-red-600 p-1"
                    title="Remove row"
                  >
                    <LuTrash className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50">
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900">
                Daily Total
              </th>
              {weekDays.map((day) => {
                const dailyTotal = entries.reduce(
                  (sum, entry) =>
                    sum + (Number(entry.hours[day.toISOString()]) || 0),
                  0
                );
                return (
                  <td
                    key={day.toISOString()}
                    className="whitespace-nowrap px-3 py-4 text-sm text-center font-medium text-slate-900"
                  >
                    <span className="w-20 inline-block text-center">
                      {dailyTotal.toFixed(1)}
                    </span>
                  </td>
                );
              })}
              <td className="whitespace-nowrap py-4 pl-3 pr-4 text-sm text-right font-medium text-slate-900">
                <span className="w-28 inline-block text-right">
                  {entries
                    .reduce(
                      (sum, entry) =>
                        sum +
                        Object.values(entry.hours).reduce(
                          (a, b) => a + (Number(b) || 0),
                          0
                        ),
                      0
                    )
                    .toFixed(1)}
                </span>
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={addProjectRow}
          disabled={!isEditable}
          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Project
        </button>

        <div className="flex gap-4">
          {isEditable && (
            <>
              <button
                type="button"
                onClick={() => saveTimesheets("draft")}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
              >
                <LuSave className="h-4 w-4" />
                Save Draft
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving || !canSubmit}
                className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LuSend className="h-4 w-4" />
                Submit
              </button>
            </>
          )}
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <ConfirmDialog
        isOpen={showConfirmSubmit}
        onClose={() => setShowConfirmSubmit(false)}
        onConfirm={() => {
          setShowConfirmSubmit(false);
          saveTimesheets("submitted");
        }}
        title="Submit Timesheet"
        message="Are you sure you want to submit this timesheet? You won't be able to make changes after submission."
      />
    </div>
  );
}
