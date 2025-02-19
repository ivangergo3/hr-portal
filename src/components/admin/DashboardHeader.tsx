'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  LuClock,
  LuBriefcase,
  LuClipboardList,
  LuCalendarOff,
  LuUsers,
} from 'react-icons/lu';

interface DashboardHeaderProps {
  stats: {
    totalUsers: number;
    totalProjects: number;
    pendingTimesheets: number;
    pendingTimeoffs: number;
    totalHours: number;
  };
}

export function DashboardHeader({ stats }: DashboardHeaderProps) {
  const [startDate, setStartDate] = useState(
    format(new Date().setDate(1), 'yyyy-MM-dd'),
  );
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
    );
    return format(lastDayOfMonth, 'yyyy-MM-dd');
  });

  return (
    <div className="bg-white shadow">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <div className="flex gap-4">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 text-slate-900"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 text-slate-900"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-slate-100 p-3">
                <LuClock className="h-6 w-6 text-slate-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="truncate text-sm font-medium text-slate-500">
                  Total Hours
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-slate-900">
                  {stats.totalHours}
                </dd>
              </div>
            </div>
          </div>

          <Link
            href="/admin/projects"
            className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 hover:bg-slate-50"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-slate-100 p-3">
                <LuBriefcase className="h-6 w-6 text-slate-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="truncate text-sm font-medium text-slate-500">
                  Active Projects
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-slate-900">
                  {stats.totalProjects}
                </dd>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/timesheets"
            className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 hover:bg-slate-50"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-slate-100 p-3">
                <LuClipboardList className="h-6 w-6 text-slate-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="truncate text-sm font-medium text-slate-500">
                  Pending Timesheets
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-slate-900">
                  {stats.pendingTimesheets}
                </dd>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/time-off"
            className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 hover:bg-slate-50"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-slate-100 p-3">
                <LuCalendarOff className="h-6 w-6 text-slate-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="truncate text-sm font-medium text-slate-500">
                  Pending Time-offs
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-slate-900">
                  {stats.pendingTimeoffs}
                </dd>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/users"
            className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 hover:bg-slate-50"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-slate-100 p-3">
                <LuUsers className="h-6 w-6 text-slate-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="truncate text-sm font-medium text-slate-500">
                  Total Employees
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-slate-900">
                  {stats.totalUsers}
                </dd>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
