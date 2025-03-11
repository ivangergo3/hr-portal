'use client';

import { LuArrowLeft, LuArrowRight } from 'react-icons/lu';
import { Button } from '../ui/button';
import { InviteUserModal } from '@/components/users/InviteUserModal';

export function UsersHeader({
  showArchived,
  onToggleArchived,
  onRefresh,
}: {
  showArchived: boolean;
  onToggleArchived: () => void;
  onRefresh: () => void;
}) {
  return (
    <div className="bg-white shadow">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-semibold text-slate-900"
              data-testid="users-header-title"
            >
              Users
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage your company&apos;s users
            </p>
          </div>
          <Button
            variant="outline"
            data-testid={`users-header-show-${
              showArchived ? 'active' : 'archived'
            }-button`}
            onClick={onToggleArchived}
          >
            {showArchived ? (
              <LuArrowLeft className="h-4 w-4" />
            ) : (
              <LuArrowRight className="h-4 w-4" />
            )}
            {showArchived ? 'Back to Active Users' : 'Show Archived Users'}
          </Button>
          <InviteUserModal refresh={onRefresh} />
        </div>
      </div>
    </div>
  );
}
