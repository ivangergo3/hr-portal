'use client';

import { useState } from 'react';
import { LuPlus } from 'react-icons/lu';
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
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="bg-white shadow">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage your company&apos;s projects
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            <LuPlus className="h-4 w-4" />
            Add Project
          </button>
        </div>
        <div className="mt-4">
          <button
            onClick={onToggleArchived}
            className="text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            {showArchived
              ? '← Back to Active Projects'
              : 'Show Archived Projects'}
          </button>
        </div>
      </div>
      <AddProjectModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          onRefresh();
          setShowAddModal(false);
        }}
      />
    </div>
  );
}
