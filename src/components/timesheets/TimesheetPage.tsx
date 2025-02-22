'use client';

import {
  User,
  TimesheetWithRelations,
  Project,
  Client,
  TimesheetStatus,
} from '@/types/database.types';
import WeeklyTimesheet from '@/components/timesheets/WeeklyTimesheet';
import WeekNavigation from '@/components/timesheets/WeekNavigation';
import { format } from 'date-fns';
import { LuCalendar } from 'react-icons/lu';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';

interface TimesheetPageProps {
  user: User;
  initialTimesheets: TimesheetWithRelations[];
  projects: (Project & { client: Client })[];
  weekStart: Date;
  weekStatus: TimesheetStatus;
}

export default function TimesheetPage({
  user,
  initialTimesheets,
  projects,
  weekStart,
  weekStatus,
}: TimesheetPageProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSkeleton rows={8} columns={3} />;
  }

  const handleWeekChange = (newWeek: Date) => {
    try {
      router.push(`/timesheets?week=${newWeek.toISOString()}`);
    } catch (error) {
      console.error('[TimesheetPage] Navigation error:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to change week. Please try again.',
      );
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-slate-900">Timesheets</h1>
          <p className="mt-2 text-sm text-slate-700">
            Record your time for the week.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <WeekNavigation
          currentWeek={weekStart}
          onWeekChange={handleWeekChange}
        />

        <div className="flex items-center gap-4 text-slate-900">
          <LuCalendar className="h-5 w-5 text-slate-900" />
          <div className="text-sm text-slate-900">
            Week of {format(weekStart, 'MMMM d, yyyy')}
          </div>
          <div
            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-slate-900 ${
              weekStatus === 'submitted'
                ? 'bg-green-50 text-green-700'
                : weekStatus === 'draft'
                  ? 'bg-slate-100 text-slate-700'
                  : 'bg-slate-50 text-slate-600'
            }`}
          >
            {weekStatus === 'submitted'
              ? 'Submitted'
              : weekStatus === 'draft'
                ? 'Draft'
                : 'No Entries'}
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <WeeklyTimesheet
          userId={user.id}
          initialTimesheets={initialTimesheets}
          projects={projects}
          weekStart={weekStart}
          weekStatus={weekStatus}
        />
      </div>
    </div>
  );
}
