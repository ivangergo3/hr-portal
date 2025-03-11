'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { TimeOffRequestWithUser } from '@/types/database.types';
import { createClient } from '@/utils/supabase/client';
import { DataTable } from '@/components/common/DataTable';
import { createColumns } from './TimeOffApprovalColumns';
import { toast } from 'sonner';
import { NewConfirmDialog } from '@/components/common/NewConfirmDialog';

type StatusFilter = 'all' | 'submitted' | 'approved' | 'rejected';

export const TimeOffApprovalContent = forwardRef<
  { refresh: () => void },
  { userId: string; statusFilter: StatusFilter }
>(({ statusFilter }, ref) => {
  const [requests, setRequests] = useState<TimeOffRequestWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<
    'approve' | 'reject' | null
  >(null);
  const [selectedRequest, setSelectedRequest] =
    useState<TimeOffRequestWithUser | null>(null);
  const supabase = createClient();

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const query = supabase
        .from('time_off_requests')
        .select(
          `
          *,
          user:users (
            id,
            email,
            full_name,
            role
          )
        `,
        )
        .order('created_at', { ascending: false });

      // Only apply status filter if not "all"
      if (statusFilter !== 'all') {
        query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('[TimeOffApproval] Fetch error:', error);
      toast.error('Failed to load time off requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  useImperativeHandle(ref, () => ({
    refresh: fetchRequests,
  }));

  const handleApprove = (request: TimeOffRequestWithUser) => {
    setSelectedAction('approve');
    setSelectedRequest(request);
    setShowConfirm(true);
  };

  const handleReject = (request: TimeOffRequestWithUser) => {
    setSelectedAction('reject');
    setSelectedRequest(request);
    setShowConfirm(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedRequest || !selectedAction) return;

    try {
      setConfirmLoading(true);
      const { error } = await supabase
        .from('time_off_requests')
        .update({
          status: selectedAction === 'approve' ? 'approved' : 'rejected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      // Update the local state to reflect the change
      setRequests(
        requests.map((r) =>
          r.id === selectedRequest.id
            ? {
                ...r,
                status: selectedAction === 'approve' ? 'approved' : 'rejected',
              }
            : r,
        ),
      );

      toast.success(
        `Request ${selectedAction === 'approve' ? 'approved' : 'rejected'} successfully`,
      );
    } catch (error) {
      console.error('[TimeOffApproval] Action error:', error);
      toast.error('Failed to process request');
    } finally {
      setConfirmLoading(false);
      setShowConfirm(false);
      setSelectedAction(null);
      setSelectedRequest(null);
    }
  };

  // Create columns with the action handlers
  const columns = createColumns(handleApprove, handleReject);

  return (
    <>
      <DataTable
        columns={columns}
        data={requests}
        isLoading={isLoading}
        filterPlaceholder="Filter time off requests..."
        defaultVisibility={{
          description: false,
          created_at: false,
        }}
      />

      {/* Confirmation Dialog */}
      <NewConfirmDialog
        isOpen={showConfirm}
        setIsOpen={setShowConfirm}
        onConfirm={handleConfirmAction}
        title={`${selectedAction === 'approve' ? 'Approve' : 'Reject'} Time Off Request`}
        message={`Are you sure you want to ${
          selectedAction === 'approve' ? 'approve' : 'reject'
        } this time off request?`}
        isLoading={confirmLoading}
        confirmText="Submit"
        cancelText="Cancel"
      />
    </>
  );
});

TimeOffApprovalContent.displayName = 'TimeOffApprovalContent';
