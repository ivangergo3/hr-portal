"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  LuUsers,
  LuBriefcase,
  LuClock,
  LuClipboardCheck,
  LuCalendarClock,
  LuSearch,
} from "react-icons/lu";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import { DateRangePicker } from "@/components/ui/DateRangePicker";

export interface DashboardMetrics {
  total_hours: number;
  active_projects: number;
  pending_timesheets: number;
  pending_timeoffs: number;
  active_employees: number;
}

export interface Timesheet {
  id: string;
  total_hours: number;
  week_start_date: string;
  project: {
    id: string;
    name: string;
    client: {
      name: string;
    };
  };
  user: {
    full_name: string;
  };
  timesheet_week: {
    status: string;
    week_start_date: string;
  };
}

interface AdminDashboardProps {
  metrics: DashboardMetrics;
  timesheets: Timesheet[];
  dateRange: {
    from: Date;
    to: Date;
  };
  onDateRangeChange: (range: { from: Date; to: Date }) => void;
}

interface ChartData {
  name: string;
  client: string;
  hours: number;
  color: string;
}

const CHART_COLORS = {
  // Base colors with good spacing in HSL color space
  colors: [
    "#2563eb", // Blue
    "#dc2626", // Red
    "#16a34a", // Green
    "#d97706", // Orange
    "#7c3aed", // Purple
    "#db2777", // Pink
    "#059669", // Emerald
    "#9333ea", // Violet
    "#ca8a04", // Yellow
    "#0891b2", // Cyan
    "#be123c", // Rose
    "#1d4ed8", // Indigo
  ],
};

const getDistinctColor = (index: number) => {
  return CHART_COLORS.colors[index % CHART_COLORS.colors.length];
};

export default function AdminDashboard({
  metrics,
  timesheets,
  dateRange,
  onDateRangeChange,
}: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSkeleton rows={4} columns={3} />;
  }

  // Prepare data for charts
  const projectData: ChartData[] = (timesheets || [])
    .reduce((acc: ChartData[], curr) => {
      const existingProject = acc.find((p) => p.name === curr.project.name);
      if (existingProject) {
        existingProject.hours += curr.total_hours;
      } else {
        acc.push({
          name: curr.project.name,
          client: curr.project.client.name,
          hours: curr.total_hours,
          color: getDistinctColor(acc.length),
        });
      }
      return acc;
    }, [])
    .sort((a, b) => b.hours - a.hours); // Sort by hours descending

  // Prepare table data
  const tableData = (timesheets || [])
    .map((entry) => ({
      id: `${entry.user.full_name}-${entry.project.name}-${entry.week_start_date}`,
      employee: {
        name: entry.user.full_name,
      },
      project: entry.project.name,
      client: entry.project.client.name,
      hours: entry.total_hours,
      week: entry.week_start_date
        ? format(new Date(entry.week_start_date), "MMM d, yyyy")
        : "N/A",
    }))
    .filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

  const stats = [
    {
      name: "Total Hours",
      value: metrics?.total_hours?.toFixed(1) || "0",
      icon: LuClock,
    },
    {
      name: "Active Projects",
      value: metrics?.active_projects?.toString() || "0",
      icon: LuBriefcase,
    },
    {
      name: "Pending Timesheets",
      value: metrics?.pending_timesheets?.toString() || "0",
      icon: LuClipboardCheck,
      href: "/admin/timesheets",
    },
    {
      name: "Pending Time-offs",
      value: metrics?.pending_timeoffs?.toString() || "0",
      icon: LuCalendarClock,
      href: "/admin/time-off",
    },
    {
      name: "Active Employees",
      value: metrics?.active_employees?.toString() || "0",
      icon: LuUsers,
    },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-slate-900">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-700">
            Overview of timesheet data and key metrics.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none text-slate-900">
          <DateRangePicker
            from={dateRange.from}
            to={dateRange.to}
            onChange={onDateRangeChange}
          />
        </div>
      </div>

      {/* Stats in one row */}
      <div className="mt-8 grid grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6"
          >
            <dt>
              <div className="absolute rounded-md bg-slate-100 p-3">
                <stat.icon
                  className="h-5 w-5 text-slate-600"
                  aria-hidden="true"
                />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-slate-500">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-xl font-semibold text-slate-900">
                {stat.value}
              </p>
              {stat.href && (
                <Link
                  href={stat.href}
                  className="ml-2 text-sm text-slate-600 hover:text-slate-900"
                >
                  →
                </Link>
              )}
            </dd>
          </div>
        ))}
      </div>

      {/* Legend for both charts */}
      <div className="mt-8">
        <div className="mb-4 rounded-lg bg-white p-4 shadow">
          <h3 className="mb-3 text-sm font-medium text-slate-900">Projects</h3>
          <div className="flex flex-wrap gap-2">
            {projectData.map((entry) => (
              <div
                key={entry.name}
                className="flex items-center gap-1.5 rounded-full bg-slate-50 px-2 py-1"
              >
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-slate-700">
                  {entry.name}
                  <span className="text-slate-400"> • </span>
                  <span className="text-slate-500">{entry.client}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Project Hours Chart */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-medium text-slate-900">
              Hours by Project
            </h3>
            <div className="mt-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectData}>
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                    tick={{ fontSize: 0 }} // Hide labels
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "6px",
                      padding: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                    {projectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Client Hours Chart */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-medium text-slate-900">
              Hours by Client
            </h3>
            <div className="mt-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectData}
                    dataKey="hours"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    label={({ value }) => `${value}`} // Show only the number
                  >
                    {projectData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "6px",
                      padding: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Table section */}
      <div className="mt-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h2 className="text-lg font-medium text-slate-900">
              Time Tracking Details
            </h2>
            <p className="mt-2 text-sm text-slate-700">
              Detailed view of hours tracked by employees across projects.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <div className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <LuSearch
                  className="h-5 w-5 text-slate-400"
                  aria-hidden="true"
                />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border-0 py-1.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-slate-600 sm:text-sm sm:leading-6"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flow-root">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-300">
              <thead>
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900">
                    Employee
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                    Project
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                    Client
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                    Week
                  </th>
                  <th className="px-3 py-3.5 text-right text-sm font-semibold text-slate-900">
                    Hours
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tableData.map((row) => (
                  <tr key={row.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                      <div className="font-medium text-slate-900">
                        {row.employee.name}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      {row.project}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      {row.client}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      {row.week}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-slate-500">
                      {row.hours}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
