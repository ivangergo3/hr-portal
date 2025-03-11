import { Button } from '@/components/ui/button';
import { TimeOffRequestWithUser } from '@/types/database.types';
import { LuCheck, LuX } from 'react-icons/lu';

// Define the action cell component
interface ActionCellProps {
  row: {
    original: TimeOffRequestWithUser;
  };
  onApprove: (request: TimeOffRequestWithUser) => void;
  onReject: (request: TimeOffRequestWithUser) => void;
}

export const ActionCell = ({ row, onApprove, onReject }: ActionCellProps) => {
  const request = row.original;

  // Only show action buttons for submitted requests
  if (request.status !== 'submitted') {
    return null;
  }

  return (
    <div className="flex gap-2 justify-center">
      <Button
        variant="ghost"
        onClick={() => onApprove(request)}
        className="text-green-600 hover:text-green-800"
        title="Approve request"
        data-testid={`time-off-approval-request-${request.id}-approve-button`}
      >
        <LuCheck className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        onClick={() => onReject(request)}
        className="text-red-600 hover:text-red-800"
        title="Reject request"
        data-testid={`time-off-approval-request-${request.id}-reject-button`}
      >
        <LuX className="h-4 w-4" />
      </Button>
    </div>
  );
};
