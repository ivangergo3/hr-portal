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
import { DashboardStats } from './AdminDashboardWrapper';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminDashboardHeaderProps {
  stats: DashboardStats;
}

export function AdminDashboardHeader({ stats }: AdminDashboardHeaderProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [endDate, setEndDate] = useState<Date | undefined>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + 1, 0);
  });

  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date);
    setStartDateOpen(false);
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date);
    setEndDateOpen(false);
  };

  return (
    <div className="bg-white shadow">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <div className="flex gap-4">
            <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-[200px] justify-start text-left font-normal',
                    !startDate && 'text-muted-foreground',
                  )}
                  data-testid="start-date-picker"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? (
                    format(startDate, 'PPP')
                  ) : (
                    <span>Start date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={handleStartDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-[200px] justify-start text-left font-normal',
                    !endDate && 'text-muted-foreground',
                  )}
                  data-testid="end-date-picker"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'PPP') : <span>End date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={handleEndDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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
                <dd
                  className="mt-1 text-3xl font-semibold text-slate-900"
                  data-testid="admin-dashboard-total-hours"
                >
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
                <dd
                  className="mt-1 text-3xl font-semibold text-slate-900"
                  data-testid="admin-dashboard-active-projects"
                >
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
                <dd
                  className="mt-1 text-3xl font-semibold text-slate-900"
                  data-testid="admin-dashboard-pending-timesheets"
                >
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
                <dd
                  className="mt-1 text-3xl font-semibold text-slate-900"
                  data-testid="admin-dashboard-pending-timeoffs"
                >
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
                <dd
                  className="mt-1 text-3xl font-semibold text-slate-900"
                  data-testid="admin-dashboard-total-employees"
                >
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
