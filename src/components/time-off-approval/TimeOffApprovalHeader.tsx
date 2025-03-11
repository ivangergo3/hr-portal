'use client';

import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

type StatusFilter = 'all' | 'submitted' | 'approved' | 'rejected';

export function TimeOffApprovalHeader({
  statusFilter,
  onFilterChange,
  onRefresh,
}: {
  statusFilter: StatusFilter;
  onFilterChange: (value: StatusFilter) => void;
  onRefresh: () => void;
}) {
  return (
    <div className="bg-white shadow">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-semibold text-slate-900"
              data-testid="time-off-approval-header-title"
            >
              Time Off Approvals
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Review and manage time off requests
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-[200px]">
              <Select
                value={statusFilter}
                onValueChange={(value) => onFilterChange(value as StatusFilter)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="submitted">Pending Approval</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              onClick={onRefresh}
              data-testid="time-off-approval-refresh-button"
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
