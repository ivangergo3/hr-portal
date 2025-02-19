"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { createClient } from "@/utils/supabase/client";

interface ProjectData {
  id: string;
  name: string;
  color: string;
  hours: number;
}

interface TimeEntry {
  employee: string;
  project: string;
  client: string;
  date: string;
  hours: number;
}

let colorIndex = 0;
function getRandomColor() {
  const colors = [
    "#4F46E5", // Indigo
    "#7C3AED", // Purple
    "#EC4899", // Pink
    "#EF4444", // Red
    "#F59E0B", // Amber
    "#10B981", // Emerald
    "#3B82F6", // Blue
  ];

  // Assign the current color and update the index
  const color = colors[colorIndex];
  colorIndex = (colorIndex + 1) % colors.length; // Loop back to the first color if all have been used

  return color;
}

export function DashboardContent() {
  const [projectData, setProjectData] = useState<ProjectData[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [filterText, setFilterText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch active projects with their clients
        const { data: projects } = await (
          await supabase
        )
          .from("projects")
          .select(
            `
            id,
            name,
            client:clients(name)
          `
          )
          .eq("archived", false);

        // Fetch timesheet entries
        const { data: entries } = await (await supabase)
          .from("timesheets")
          .select(
            `
            total_hours,
            created_at,
            project:projects(name),
            client:clients(name),
            user:users!timesheets_user_id_fkey(full_name)
          `
          );

        if (projects && entries) {
          // Process project data with colors
          const projectHours = projects
            .map((project) => ({
              id: project.id,
              name: `${project.name} - ${project.client?.name}`,
              color: getRandomColor(),
              hours: entries
                .filter((entry) => entry.project?.name === project.name)
                .reduce((sum, entry) => sum + (entry.total_hours || 0), 0),
            }))
            .filter((project) => project.hours > 0);
          setProjectData(projectHours);

          // Update time entries
          const timeEntryData = entries.map((entry) => ({
            employee: entry.user?.full_name || "Unknown",
            project: entry.project?.name || "Unknown",
            client: entry.client?.name || "Unknown",
            date: entry.created_at,
            hours: entry.total_hours || 0,
          }));
          setTimeEntries(timeEntryData);
        }
      } catch (error) {
        console.error("[Dashboard] Data fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="mt-6 px-4 sm:px-6 lg:px-8">
        <div className="relative min-h-[200px]">
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-slate-600 animate-bounce [animation-delay:-0.3s]" />
              <div className="w-4 h-4 rounded-full bg-slate-600 animate-bounce [animation-delay:-0.15s]" />
              <div className="w-4 h-4 rounded-full bg-slate-600 animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Projects Overview */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-slate-900 mb-4">
          Projects Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {projectData.map(
            (project) =>
              project.hours > 0 && (
                <div
                  key={project.id}
                  className="flex items-center space-x-2 p-2 rounded border border-slate-200"
                >
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="text-sm text-slate-600 truncate">
                    {project.name}
                  </span>
                </div>
              )
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-slate-900 mb-4">
            Hours by Project
          </h2>
          <div className="h-[300px]">
            <BarChart width={500} height={300} data={projectData}>
              <XAxis dataKey="name" tick={false} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="hours">
                {projectData.map(
                  (entry, index) =>
                    entry.hours > 0 && (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    )
                )}
              </Bar>
            </BarChart>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-slate-900 mb-4">
            Work Distribution
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectData}
                  dataKey="hours"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  fill="#8884d8"
                >
                  {projectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Time Tracking Details */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-medium text-slate-900">
            Time Tracking Details
          </h2>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Filter entries..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full max-w-xs rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 text-slate-900"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Hours
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {timeEntries
                .filter(
                  (entry) =>
                    entry.employee
                      .toLowerCase()
                      .includes(filterText.toLowerCase()) ||
                    entry.project
                      .toLowerCase()
                      .includes(filterText.toLowerCase()) ||
                    entry.client
                      .toLowerCase()
                      .includes(filterText.toLowerCase())
                )
                .map((entry, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {entry.employee}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {entry.project}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {entry.client}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {format(new Date(entry.date), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {entry.hours}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
