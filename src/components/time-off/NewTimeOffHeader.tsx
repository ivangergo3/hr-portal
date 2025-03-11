'use client';

import { LuArrowLeft, LuArrowRight } from 'react-icons/lu';
import { Button } from '../ui/button';
import { AddTimeOffRequestModal } from './AddTimeOffRequestModal';

export function TimeOffHeader({
  showPending,
  onToggleView,
  onRefresh,
}: {
  showPending: boolean;
  onToggleView: () => void;
  onRefresh: () => void;
}) {
  return (
    <div className="bg-white shadow">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-semibold text-slate-900"
              data-testid="time-off-header-title"
            >
              Time Off
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage your time off requests
            </p>
          </div>
          <Button
            variant="outline"
            data-testid={`time-off-header-show-${
              showPending ? 'pending' : 'approved'
            }-button`}
            onClick={onToggleView}
          >
            {showPending ? (
              <LuArrowLeft className="h-4 w-4" />
            ) : (
              <LuArrowRight className="h-4 w-4" />
            )}
            {showPending ? 'Show Approved Requests' : 'Show Pending Requests'}
          </Button>
          <AddTimeOffRequestModal refresh={onRefresh} />
        </div>
      </div>
    </div>
  );
}
