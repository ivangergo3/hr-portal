'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { WeekSelector } from '@/components/timesheets/WeekSelector';
import { TimesheetForm } from '@/components/timesheets/TimesheetForm';
import { LoadingOverlay } from '@/components/common/LoadingOverlay';
import type { User, Project, Timesheet } from '@/types/database.types';

type TimesheetLayoutProps = {
  user: User;
  projects: Project[];
  weekStart: Date;
  weekStatus: string;
  timesheets: Timesheet[];
};

export function TimesheetLayout({
  user,
  projects,
  weekStart,
  weekStatus,
  timesheets,
}: TimesheetLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const handleSuccess = () => {
    router.refresh();
  };

  useEffect(() => {
    setIsLoading(false);
  }, [searchParams]);

  useEffect(() => {
    // Remove initial loading state after a short delay
    const timer = setTimeout(() => setIsInitialLoad(false), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            Record your time for the week
          </h1>
          <WeekSelector weekStart={weekStart} onLoadingChange={setIsLoading} />
        </div>
      </header>

      <div className="mt-6 px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {(isLoading || isInitialLoad) && <LoadingOverlay />}
          <TimesheetForm
            key={weekStart.toISOString()}
            user={user}
            projects={projects}
            weekStart={weekStart}
            weekStatus={weekStatus}
            initialTimesheets={timesheets}
            onSave={handleSuccess}
          />
        </div>
      </div>
    </div>
  );
}
