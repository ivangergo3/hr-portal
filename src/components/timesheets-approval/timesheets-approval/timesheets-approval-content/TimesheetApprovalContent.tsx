'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { TimesheetStatus } from '@/types/database.types';
import { createClient } from '@/utils/supabase/client';
import { DataTable } from '@/components/common/DataTable';
import { createColumns } from './TimesheetApprovalColumns';
import { toast } from 'sonner';
import { NewConfirmDialog } from '@/components/common/NewConfirmDialog';
import { useRouter } from 'next/navigation';

type StatusFilter = 'all' | 'submitted' | 'approved' | 'rejected' | 'draft';

// Update the response type
type TimesheetResponse = {
  id: string;
  week_start_date: string;
  status: TimesheetStatus;
  total_hours: number;
  user_id: string;
  updated_at: string;
  created_at: string;
  user: {
    id: string;
    full_name: string;
    email: string;
  };
};

export const TimesheetApprovalContent = forwardRef<
  { refresh: () => void },
  { userId: string; statusFilter: StatusFilter }
>(({ statusFilter }, ref) => {
  const [isLoading, setIsLoading] = useState(true);
  const [timesheets, setTimesheets] = useState<TimesheetResponse[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<
    'approve' | 'reject' | null
  >(null);
  const [selectedTimesheet, setSelectedTimesheet] =
    useState<TimesheetResponse | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const fetchTimesheets = async () => {
    try {
      setIsLoading(true);
      const query = supabase
        .from('timesheet_weeks')
        .select(
          `
          id,
          week_start_date,
          status,
          total_hours,
          user_id,
          updated_at,
          created_at,
          user:users!timesheet_weeks_user_id_fkey (
            id,
            full_name,
            email
          )
        `,
        )
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTimesheets(data as unknown as TimesheetResponse[]);
    } catch (error) {
      console.error('[TimesheetApproval] Fetch error:', error);
      toast.error('Failed to load timesheets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimesheets();
  }, [statusFilter]);

  useImperativeHandle(ref, () => ({
    refresh: fetchTimesheets,
  }));

  const handleReview = (timesheet: TimesheetResponse) => {
    router.push(`/admin/timesheets/${timesheet.id}/review`);
  };

  const handleApprove = (timesheet: TimesheetResponse) => {
    setSelectedAction('approve');
    setSelectedTimesheet(timesheet);
    setShowConfirm(true);
  };

  const handleReject = (timesheet: TimesheetResponse) => {
    setSelectedAction('reject');
    setSelectedTimesheet(timesheet);
    setShowConfirm(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedTimesheet || !selectedAction) return;

    try {
      setConfirmLoading(true);
      const { error } = await supabase
        .from('timesheet_weeks')
        .update({
          status: selectedAction === 'approve' ? 'approved' : 'rejected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedTimesheet.id);

      if (error) throw error;

      // Update the local state to reflect the change
      setTimesheets(
        timesheets.map((t) =>
          t.id === selectedTimesheet.id
            ? {
                ...t,
                status: selectedAction === 'approve' ? 'approved' : 'rejected',
              }
            : t,
        ),
      );

      toast.success(
        `Timesheet ${selectedAction === 'approve' ? 'approved' : 'rejected'} successfully`,
      );
    } catch (error) {
      console.error('[TimesheetApproval] Action error:', error);
      toast.error('Failed to process timesheet');
    } finally {
      setConfirmLoading(false);
      setShowConfirm(false);
      setSelectedAction(null);
      setSelectedTimesheet(null);
    }
  };

  // Create columns with the action handlers
  const columns = createColumns(handleReview, handleApprove, handleReject);

  return (
    <>
      <div className="mt-6 px-4 sm:px-6 lg:px-8">
        <DataTable
          columns={columns}
          data={timesheets}
          isLoading={isLoading}
          filterPlaceholder="Filter timesheets..."
          defaultVisibility={{
            created_at: false,
          }}
        />
      </div>

      {/* Confirmation Dialog */}
      <NewConfirmDialog
        isOpen={showConfirm}
        setIsOpen={setShowConfirm}
        onConfirm={handleConfirmAction}
        title={`${selectedAction === 'approve' ? 'Approve' : 'Reject'} Timesheet`}
        message={`Are you sure you want to ${
          selectedAction === 'approve' ? 'approve' : 'reject'
        } this timesheet?`}
        isLoading={confirmLoading}
        confirmText="Submit"
        cancelText="Cancel"
      />
    </>
  );
});

TimesheetApprovalContent.displayName = 'TimesheetApprovalContent';
