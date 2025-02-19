'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TimesheetReviewHeader } from './TimesheetReviewHeader';
import TimesheetReview from '@/components/admin/TimesheetReview';
import type { TimesheetWeekWithRelations } from '@/types/database.types';
import Notification from '@/components/common/Notification';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { createClient } from '@/utils/supabase/client';

interface TimesheetReviewWrapperProps {
  timesheetId: string;
  userId: string;
}

export default function TimesheetReviewWrapper({
  timesheetId,
}: TimesheetReviewWrapperProps) {
  const [timesheet, setTimesheet] = useState<TimesheetWeekWithRelations | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedAction, setSelectedAction] = useState<
    'approve' | 'reject' | null
  >(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
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
        console.error('[TimesheetReview] Fetch error:', error);
        setNotification({
          message: 'Failed to load timesheet',
          type: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimesheet();
  }, [timesheetId]);

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

      setNotification({
        message: `Timesheet ${
          selectedAction === 'approve' ? 'approved' : 'rejected'
        } successfully`,
        type: 'success',
      });

      router.push('/admin/timesheets');
    } catch (error) {
      console.error('[TimesheetReview] Action error:', error);
      setNotification({
        message: 'Failed to process timesheet',
        type: 'error',
      });
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
      {isActionLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-slate-600 animate-bounce [animation-delay:-0.3s]" />
            <div className="w-4 h-4 rounded-full bg-slate-600 animate-bounce [animation-delay:-0.15s]" />
            <div className="w-4 h-4 rounded-full bg-slate-600 animate-bounce" />
          </div>
        </div>
      )}

      <TimesheetReviewHeader
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
      <TimesheetReview timesheet={timesheet} isLoading={isLoading} />

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setSelectedAction(null);
        }}
        onConfirm={handleAction}
        title={`${
          selectedAction === 'approve' ? 'Approve' : 'Reject'
        } Timesheet`}
        message={`Are you sure you want to ${selectedAction} this timesheet from ${timesheet?.user.full_name}?`}
      />

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
}
