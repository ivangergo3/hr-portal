'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TimesheetHeader } from '@/components/timesheets/TimesheetHeader';
import { TimesheetContent } from '@/components/timesheets/TimesheetContent';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import { NewConfirmDialog } from '@/components/common/NewConfirmDialog';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import type {
  Project,
  Timesheet,
  TimesheetStatus,
} from '@/types/database.types';

interface TimesheetWrapperProps {
  projects: Project[];
  weekStart: Date;
}

export function TimesheetWrapper({
  projects,
  weekStart,
}: TimesheetWrapperProps) {
  const { dbUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<TimesheetStatus>('draft');
  const [currentTimesheets, setCurrentTimesheets] = useState<Timesheet[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState<'submit' | 'save'>('save');
  const [dataLoading, setDataLoading] = useState(true);

  const supabase = createClient();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !dbUser) {
      router.push('/login');
    }
  }, [dbUser, authLoading, router]);

  // Fetch user-specific timesheets and timesheet week
  useEffect(() => {
    const fetchUserData = async () => {
      if (!dbUser) return;

      setDataLoading(true);
      try {
        // Fetch timesheets for the current user and week
        const { data: timesheets, error: timesheetsError } = await supabase
          .from('timesheets')
          .select('*')
          .eq('user_id', dbUser.id)
          .eq('week_id', weekStart.toISOString().split('T')[0]);

        if (timesheetsError) throw timesheetsError;

        // Fetch timesheet week for the current user and week
        const { data: timesheetWeeks, error: weeksError } = await supabase
          .from('timesheet_weeks')
          .select('*')
          .eq('user_id', dbUser.id)
          .eq('week_start_date', weekStart.toISOString().split('T')[0]);

        if (weeksError) throw weeksError;

        setCurrentTimesheets(timesheets || []);
        setCurrentStatus(timesheetWeeks?.[0]?.status || 'draft');
      } catch (error) {
        console.error('[TimesheetWrapper] Error fetching user data:', error);
        toast.error('Failed to load timesheet data');
      } finally {
        setDataLoading(false);
      }
    };

    if (dbUser) {
      fetchUserData();
    }
  }, [dbUser, weekStart, supabase]);

  // Remove initial loading state after a short delay
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoad(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleLoadingChange = (loading: boolean) => {
    setIsLoading(loading);
  };

  const handleSaveDraft = async () => {
    setActionType('save');
    setShowConfirmDialog(true);
  };

  const handleSubmit = async () => {
    setActionType('submit');
    setShowConfirmDialog(true);
  };

  const handleConfirmAction = async () => {
    if (!dbUser) return;

    setIsLoading(true);
    try {
      // Update timesheet week status
      const { error } = await supabase
        .from('timesheet_weeks')
        .upsert({
          user_id: dbUser.id,
          week_start_date: weekStart.toISOString(),
          status: actionType === 'submit' ? 'submitted' : 'draft',
          total_hours: currentTimesheets.reduce(
            (sum, t) =>
              sum +
              (t.monday_hours || 0) +
              (t.tuesday_hours || 0) +
              (t.wednesday_hours || 0) +
              (t.thursday_hours || 0) +
              (t.friday_hours || 0) +
              (t.saturday_hours || 0) +
              (t.sunday_hours || 0),
            0,
          ),
        })
        .select();

      if (error) throw error;

      // Show success message
      toast.success(
        actionType === 'submit'
          ? 'Timesheet submitted successfully'
          : 'Timesheet saved as draft',
      );

      // Update local state
      setCurrentStatus(actionType === 'submit' ? 'submitted' : 'draft');

      // Refresh the page to get updated data
      router.refresh();
    } catch (error) {
      console.error('[TimesheetWrapper] Error:', error);
      toast.error(
        actionType === 'submit'
          ? 'Failed to submit timesheet'
          : 'Failed to save timesheet',
      );
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  // Don't render anything if not authenticated or still loading auth
  if (authLoading || !dbUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TimesheetHeader
        weekStart={weekStart}
        status={currentStatus}
        onLoadingChange={handleLoadingChange}
        onSaveDraft={handleSaveDraft}
        onSubmit={handleSubmit}
        isLoading={isLoading || dataLoading}
      />

      <div className="mt-6 px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {(isLoading || isInitialLoad || dataLoading) && <LoadingSkeleton />}
          {!(isLoading || isInitialLoad || dataLoading) && (
            <TimesheetContent
              projects={projects}
              timesheets={currentTimesheets}
              isLoading={isLoading}
              status={currentStatus}
              user={dbUser}
              weekStart={weekStart}
            />
          )}
        </div>
      </div>

      <NewConfirmDialog
        isOpen={showConfirmDialog}
        setIsOpen={setShowConfirmDialog}
        onConfirm={handleConfirmAction}
        title={
          actionType === 'submit'
            ? 'Submit Timesheet'
            : 'Save Timesheet as Draft'
        }
        message={
          actionType === 'submit'
            ? 'Are you sure you want to submit this timesheet? Once submitted, it will be sent for approval and cannot be edited further.'
            : 'Save your current timesheet as a draft to continue editing later.'
        }
        isLoading={isLoading}
        confirmText="Submit"
        cancelText="Cancel"
      />
    </div>
  );
}
