'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { LuCheck, LuX, LuClipboardList } from 'react-icons/lu';
import type { TimesheetStatus } from '@/types/database.types';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Notification from '@/components/common/Notification';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

interface TimesheetApprovalContentProps {
  userId: string;
  selectedWeek: Date;
  onWeekChange: (date: Date) => void;
}

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

export function TimesheetApprovalContent({
  selectedWeek,
}: TimesheetApprovalContentProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [timesheets, setTimesheets] = useState<TimesheetResponse[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | TimesheetStatus>(
    'submitted',
  );
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedAction, setSelectedAction] = useState<
    'approve' | 'reject' | null
  >(null);
  const [selectedTimesheet, setSelectedTimesheet] =
    useState<TimesheetResponse | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
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
          .eq('week_start_date', selectedWeek.toISOString().split('T')[0])
          .order('created_at', { ascending: false });

        if (statusFilter !== 'all') {
          query.eq('status', statusFilter);
        }

        const { data, error } = await query;

        if (error) {
          console.error('[TimesheetApproval] Fetch error:', error);
          return;
        }

        setTimesheets(data as unknown as TimesheetResponse[]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimesheets();
  }, [statusFilter, selectedWeek]);

  const handleAction = async () => {
    if (!selectedTimesheet || !selectedAction) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('timesheet_weeks')
        .update({
          status: selectedAction === 'approve' ? 'approved' : 'rejected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedTimesheet.id);

      if (error) throw error;

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

      setNotification({
        message: `Timesheet ${
          selectedAction === 'approve' ? 'approved' : 'rejected'
        } successfully`,
        type: 'success',
      });
    } catch (error) {
      console.error('[TimesheetApproval] Action error:', error);
      setNotification({
        message: 'Failed to process timesheet',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
      setSelectedAction(null);
      setSelectedTimesheet(null);
    }
  };

  return (
    <div className="mt-6 px-4 sm:px-6 lg:px-8">
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-slate-600 animate-bounce [animation-delay:-0.3s]" />
              <div className="w-4 h-4 rounded-full bg-slate-600 animate-bounce [animation-delay:-0.15s]" />
              <div className="w-4 h-4 rounded-full bg-slate-600 animate-bounce" />
            </div>
          </div>
        )}

        <div className="mb-4 flex justify-end">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as 'all' | TimesheetStatus)
            }
            className="rounded-md border-slate-300 text-sm focus:border-slate-500 focus:ring-slate-500 text-slate-900"
          >
            <option value="all">All Timesheets</option>
            <option value="submitted">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="draft">Drafts</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
                >
                  Employee
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
                >
                  Week
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
                >
                  Hours
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {timesheets.map((timesheet) => (
                <tr key={timesheet.id}>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                    {timesheet.user.full_name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                    {format(new Date(timesheet.week_start_date), 'MMM d, yyyy')}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                    {timesheet.total_hours}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                          timesheet.status === 'submitted'
                            ? 'bg-yellow-50 text-yellow-700'
                            : timesheet.status === 'approved'
                              ? 'bg-green-50 text-green-700'
                              : timesheet.status === 'rejected'
                                ? 'bg-red-50 text-red-700'
                                : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {timesheet.status}
                      </span>
                      <div className="flex gap-2 ml-6">
                        <button
                          onClick={() => {
                            // Open review modal/page
                            router.push(
                              `/admin/timesheets/${timesheet.id}/review`,
                            );
                          }}
                          className="text-slate-600 hover:text-slate-800"
                          title="Review timesheet"
                        >
                          <LuClipboardList className="h-4 w-4" />
                        </button>
                        {timesheet.status === 'submitted' && (
                          <div className="flex gap-2 ml-6">
                            <button
                              onClick={() => {
                                setSelectedAction('approve');
                                setSelectedTimesheet(timesheet);
                                setShowConfirm(true);
                              }}
                              className="text-green-600 hover:text-green-800"
                              title="Approve timesheet"
                            >
                              <LuCheck className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAction('reject');
                                setSelectedTimesheet(timesheet);
                                setShowConfirm(true);
                              }}
                              className="text-red-600 hover:text-red-800"
                              title="Reject timesheet"
                            >
                              <LuX className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setSelectedAction(null);
          setSelectedTimesheet(null);
        }}
        onConfirm={handleAction}
        title={`${
          selectedAction === 'approve' ? 'Approve' : 'Reject'
        } Timesheet`}
        message={`Are you sure you want to ${selectedAction} this timesheet from ${selectedTimesheet?.user.full_name}?`}
      />

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
