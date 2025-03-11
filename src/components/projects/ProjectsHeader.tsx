'use client';

import { LuArrowLeft, LuArrowRight } from 'react-icons/lu';
import { Button } from '../ui/button';
import { AddProjectModal } from './AddProjectModal';

export function ProjectsHeader({
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
              data-testid="projects-header-title"
            >
              Projects
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage your company&apos;s projects
            </p>
          </div>
          <Button
            variant="outline"
            data-testid={`projects-header-show-${
              showArchived ? 'active' : 'archived'
            }-button`}
            onClick={onToggleArchived}
          >
            {showArchived ? (
              <LuArrowLeft className="h-4 w-4" />
            ) : (
              <LuArrowRight className="h-4 w-4" />
            )}
            {showArchived
              ? 'Back to Active Projects'
              : 'Show Archived Projects'}
          </Button>
          <AddProjectModal refresh={onRefresh} />
        </div>
      </div>
    </div>
  );
}
