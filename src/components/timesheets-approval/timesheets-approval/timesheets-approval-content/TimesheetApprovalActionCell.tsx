import { Button } from '@/components/ui/button';
import { LuCheck, LuX, LuClipboardList } from 'react-icons/lu';
import type { TimesheetStatus } from '@/types/database.types';

// Define the TimesheetResponse type
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

// Define the action cell component
interface TimesheetApprovalActionCellProps {
  row: {
    original: TimesheetResponse;
  };
  onReview: (timesheet: TimesheetResponse) => void;
  onApprove: (timesheet: TimesheetResponse) => void;
  onReject: (timesheet: TimesheetResponse) => void;
}

export const TimesheetApprovalActionCell = ({
  row,
  onReview,
  onApprove,
  onReject,
}: TimesheetApprovalActionCellProps) => {
  const timesheet = row.original;

  return (
    <div className="flex gap-2 justify-center">
      <Button
        variant="ghost"
        onClick={() => onReview(timesheet)}
        className="text-slate-600 hover:text-slate-800"
        title="Review timesheet"
        data-testid={`timesheet-approval-row-${timesheet.id}-review-button`}
      >
        <LuClipboardList className="h-4 w-4" />
      </Button>

      {/* Only show approve/reject buttons for submitted timesheets */}
      <>
        <Button
          variant="ghost"
          onClick={() => onApprove(timesheet)}
          className="text-green-600 hover:text-green-800"
          title="Approve timesheet"
          data-testid={`timesheet-approval-row-${timesheet.id}-approve-button`}
          disabled={timesheet.status !== 'submitted'}
        >
          <LuCheck className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          onClick={() => onReject(timesheet)}
          className="text-red-600 hover:text-red-800"
          title="Reject timesheet"
          data-testid={`timesheet-approval-row-${timesheet.id}-reject-button`}
          disabled={timesheet.status !== 'submitted'}
        >
          <LuX className="h-4 w-4" />
        </Button>
      </>
    </div>
  );
};
