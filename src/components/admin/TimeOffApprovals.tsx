'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { LuCheck, LuX } from 'react-icons/lu';
import { TimeOffStatus, TimeOffRequestWithUser } from '@/types/database.types';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Notification from '@/components/common/Notification';
import { withRetry } from '@/utils/apiRetry';
import { createClientServer } from '@/utils/supabase/server';

interface TimeOffApprovalsProps {
  initialRequests: TimeOffRequestWithUser[];
}

export default function TimeOffApprovals({
  initialRequests,
}: TimeOffApprovalsProps) {
  const [requests, setRequests] =
    useState<TimeOffRequestWithUser[]>(initialRequests);
  const [selectedRequest, setSelectedRequest] =
    useState<TimeOffRequestWithUser | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | TimeOffStatus>(
    'all',
  );

  const supabase = createClientServer();

  useEffect(() => {
    setRequests(initialRequests);
  }, [initialRequests]);

  const handleAction = async (
    request: TimeOffRequestWithUser,
    action: 'approve' | 'reject',
  ) => {
    try {
      setError(null);
      setIsUpdating(true);

      await withRetry(
        async () => {
          const { error: updateError } = await (
            await supabase
          )
            .from('time_off_requests')
            .update({
              status: action === 'approve' ? 'approved' : 'rejected',
              updated_at: new Date().toISOString(),
            })
            .eq('id', request.id);
          if (updateError) throw updateError;
          return true;
        },
        { maxAttempts: 3, delayMs: 1000 },
      );

      setRequests((prev) =>
        prev.map((r) =>
          r.id === request.id
            ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' }
            : r,
        ),
      );

      setNotification({
        message: `Time off request ${action}d successfully`,
        type: 'success',
      });
    } catch (error) {
      console.error('[TimeOffApprovals] Action error:', error);
      setError(
        error instanceof Error
          ? error.message
          : `Failed to ${action} request. Please try again.`,
      );
    } finally {
      setIsUpdating(false);
      setShowConfirm(false);
      setSelectedRequest(null);
      setAction(null);
    }
  };

  const filteredRequests =
    statusFilter === 'all'
      ? requests
      : requests.filter((request) => request.status === statusFilter);

  if (!requests.length) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-600">No time off requests found.</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-slate-900">
            Time Off Approvals
          </h1>
          <p className="mt-2 text-sm text-slate-700">
            Review and approve employee time off requests.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as 'all' | TimeOffStatus)
            }
            className="rounded-md border-slate-300 text-sm focus:border-slate-500 focus:ring-slate-500 text-slate-900"
          >
            <option value="all">All Requests</option>
            <option value="submitted">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-0"
                  >
                    Employee
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
                  >
                    Dates
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
                  >
                    Status
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-0">
                      {request.user.full_name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      {request.type.charAt(0).toUpperCase() +
                        request.type.slice(1)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      {format(new Date(request.start_date), 'MMM d')} -{' '}
                      {format(new Date(request.end_date), 'MMM d, yyyy')}
                    </td>
                    <td className="px-3 py-4 text-sm text-slate-500 max-w-md truncate">
                      {request.description}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                          request.status === 'submitted'
                            ? 'bg-yellow-50 text-yellow-700'
                            : request.status === 'approved'
                              ? 'bg-green-50 text-green-700'
                              : request.status === 'rejected'
                                ? 'bg-red-50 text-red-700'
                                : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {request.status.charAt(0).toUpperCase() +
                          request.status.slice(1)}
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      {request.status === 'submitted' && (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleAction(request, 'approve')}
                            className="text-green-600 hover:text-green-900"
                            disabled={isUpdating}
                          >
                            <LuCheck className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleAction(request, 'reject')}
                            className="text-red-600 hover:text-red-900"
                            disabled={isUpdating}
                          >
                            <LuX className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setSelectedRequest(null);
          setAction(null);
        }}
        onConfirm={() => {
          if (selectedRequest && action) {
            handleAction(selectedRequest, action);
          }
        }}
        title={`${action?.charAt(0).toUpperCase()}${action?.slice(1)} Request`}
        message={`Are you sure you want to ${action} this time off request?`}
        isLoading={isUpdating}
      />

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
