'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { TimeTrackingTable } from './TimeTrackingTable';
import { TimeEntry } from './TimeTrackingColumns';
import { DashboardCharts, ProjectChartData } from './DashboardCharts';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';

// Define types for the data returned from Supabase
interface ProjectResponse {
  id: string;
  name: string;
  client: {
    name: string;
  } | null;
}

interface TimesheetResponse {
  total_hours: number;
  created_at: string;
  project: {
    name: string;
  } | null;
  client: {
    name: string;
  } | null;
  user: {
    full_name: string;
  } | null;
}

let colorIndex = 0;
function getRandomColor() {
  const colors = [
    '#4F46E5', // Indigo
    '#7C3AED', // Purple
    '#EC4899', // Pink
    '#EF4444', // Red
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#3B82F6', // Blue
  ];

  // Assign the current color and update the index
  const color = colors[colorIndex];
  colorIndex = (colorIndex + 1) % colors.length; // Loop back to the first color if all have been used

  return color;
}

export function AdminDashboardContent() {
  const [projectData, setProjectData] = useState<ProjectChartData[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch active projects with their clients
        const { data: projectsData } = await (
          await supabase
        )
          .from('projects')
          .select(
            `
            id,
            name,
            client:clients(name)
          `,
          )
          .eq('archived', false);

        // Fetch timesheet entries
        const { data: entriesData } = await (await supabase)
          .from('timesheets')
          .select(
            `
            total_hours,
            created_at,
            project:projects(name),
            client:clients(name),
            user:users!timesheets_user_id_fkey(full_name)
          `,
          );

        if (projectsData && entriesData) {
          // Type assertion with proper types
          const projects = projectsData as unknown as ProjectResponse[];
          const entries = entriesData as unknown as TimesheetResponse[];

          // Process project data with colors
          const projectHours = projects
            .map((project) => ({
              id: project.id,
              name: `${project.name} - ${project.client?.name || 'No Client'}`,
              color: getRandomColor(),
              hours: entries
                .filter((entry) => entry.project?.name === project.name)
                .reduce((sum, entry) => sum + (entry.total_hours || 0), 0),
            }))
            .filter((project) => project.hours > 0);
          setProjectData(projectHours);

          // Update time entries
          const timeEntryData = entries.map((entry) => ({
            employee: entry.user?.full_name || 'Unknown',
            project: entry.project?.name || 'Unknown',
            client: entry.client?.name || 'Unknown',
            date: entry.created_at,
            hours: entry.total_hours || 0,
          }));
          setTimeEntries(timeEntryData);
        }
      } catch (error) {
        console.error('[Dashboard] Data fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="mt-6 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-slate-900 mb-4">
          Projects Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {projectData.map(
            (project) =>
              project.hours > 0 && (
                <div
                  data-testid={`project-overview-row-${project.name.toLowerCase().replace(/ /g, '-')}`}
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
              ),
          )}
        </div>
      </div>

      {/* Charts */}
      <DashboardCharts projectData={projectData} />

      {/* Time Tracking Details */}
      <TimeTrackingTable timeEntries={timeEntries} isLoading={isLoading} />
    </div>
  );
}
