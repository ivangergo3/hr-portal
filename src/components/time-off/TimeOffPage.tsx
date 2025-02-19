'use client';

import { useState, useEffect } from 'react';
import { TimeOffRequest, TimeOffRequestWithUser } from '@/types/database.types';
import TimeOffRequestForm from './TimeOffRequestForm';
import TimeOffRequestList from './TimeOffRequestList';
import { LuPlus } from 'react-icons/lu';
import { User } from '@supabase/supabase-js';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import EmptyState from '@/components/common/EmptyState';

interface TimeOffPageProps {
  user: User;
  initialRequests: TimeOffRequestWithUser[];
  userRole: string;
}

export default function TimeOffPage({
  user,
  initialRequests,
}: TimeOffPageProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState<TimeOffRequest | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleEdit = (request: TimeOffRequest) => {
    setEditingRequest(request);
    setShowForm(true);
  };

  if (isLoading) {
    return <LoadingSkeleton rows={5} columns={4} />;
  }

  if (initialRequests.length === 0) {
    return (
      <EmptyState
        title="No time off requests"
        message="You haven't made any time off requests yet."
        action={{
          label: 'Request Time Off',
          onClick: () => setShowForm(true),
        }}
      />
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-slate-900">Time Off</h1>
          <p className="mt-2 text-sm text-slate-700">
            Request and manage your time off.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-700"
          >
            <LuPlus className="h-4 w-4" />
            New Request
          </button>
        </div>
      </div>

      {showForm ? (
        <TimeOffRequestForm
          userId={user.id}
          initialRequest={editingRequest}
          onCancel={() => {
            setShowForm(false);
            setEditingRequest(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingRequest(null);
            window.location.reload();
          }}
        />
      ) : (
        <TimeOffRequestList requests={initialRequests} onEdit={handleEdit} />
      )}
    </div>
  );
}
