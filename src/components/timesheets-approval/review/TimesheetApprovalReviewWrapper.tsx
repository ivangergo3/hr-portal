'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TimesheetApprovalReviewHeader } from './TimesheetApprovalReviewHeader';
import { TimesheetApprovalReviewContent } from './TimesheetApprovalReviewContent';
import type { TimesheetWeekWithRelations } from '@/types/database.types';
import { toast } from 'sonner';
import { NewConfirmDialog } from '@/components/common/NewConfirmDialog';
import { createClient } from '@/utils/supabase/client';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';

interface TimesheetApprovalReviewWrapperProps {
  timesheetId: string;
  userId: string;
}

export default function TimesheetApprovalReviewWrapper({
  timesheetId,
}: TimesheetApprovalReviewWrapperProps) {
  const [timesheet, setTimesheet] = useState<TimesheetWeekWithRelations | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedAction, setSelectedAction] = useState<
    'approve' | 'reject' | null
  >(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchTimesheet = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('timesheet_weeks')
          .select(
            `
            *,
            user:users!timesheet_weeks_user_id_fkey (
              id,
              full_name,
              email
            ),
            timesheets (
              id,
              monday_hours,
              tuesday_hours,
              wednesday_hours,
              thursday_hours,
              friday_hours,
              project:projects (
                id,
                name,
                client:clients (
                  id,
                  name
                )
              )
            )
          `,
          )
          .eq('id', timesheetId)
          .single();

        if (error) throw error;
        setTimesheet(data);
      } catch (error) {
        console.error('[TimesheetApprovalReview] Fetch error:', error);
        toast.error('Failed to load timesheet');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimesheet();
  }, [timesheetId, supabase]);

  const handleAction = async () => {
    if (!timesheet || !selectedAction) return;

    try {
      setIsActionLoading(true);
      const { error } = await supabase
        .from('timesheet_weeks')
        .update({
          status: selectedAction === 'approve' ? 'approved' : 'rejected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', timesheet.id);

      if (error) throw error;

      toast.success(
        `Timesheet ${
          selectedAction === 'approve' ? 'approved' : 'rejected'
        } successfully`,
      );

      router.push('/admin/timesheets');
    } catch (error) {
      console.error('[TimesheetApprovalReview] Action error:', error);
      toast.error('Failed to process timesheet');
    } finally {
      setIsActionLoading(false);
      setShowConfirm(false);
      setSelectedAction(null);
    }
  };

  if (!timesheet && !isLoading) {
    return <div>Timesheet not found</div>;
  }

  return (
    <>
      {isActionLoading && <LoadingSkeleton />}

      <TimesheetApprovalReviewHeader
        timesheet={timesheet}
        onBack={() => router.push('/admin/timesheets')}
        onApprove={() => {
          setSelectedAction('approve');
          setShowConfirm(true);
        }}
        onReject={() => {
          setSelectedAction('reject');
          setShowConfirm(true);
        }}
        isLoading={isLoading}
      />

      <TimesheetApprovalReviewContent
        timesheet={timesheet}
        isLoading={isLoading}
      />

      <NewConfirmDialog
        isOpen={showConfirm}
        setIsOpen={setShowConfirm}
        onConfirm={handleAction}
        title={`${
          selectedAction === 'approve' ? 'Approve' : 'Reject'
        } Timesheet`}
        message={`Are you sure you want to ${
          selectedAction === 'approve' ? 'approve' : 'reject'
        } this timesheet from ${timesheet?.user.full_name}?`}
        isLoading={isActionLoading}
        confirmText="Submit"
        cancelText="Cancel"
      />
    </>
  );
}
