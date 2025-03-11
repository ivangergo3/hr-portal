'use client';

import { useState, useRef, useEffect } from 'react';
import { Suspense } from 'react';
import { TimesheetApprovalHeader } from './TimesheetApprovalHeader';
import { TimesheetApprovalContent } from './timesheets-approval-content/TimesheetApprovalContent';
import LoadingSkeleton from '../../common/LoadingSkeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function TimesheetApprovalWrapper() {
  const { dbUser, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'submitted' | 'approved' | 'rejected' | 'draft'
  >('submitted');
  const contentRef = useRef<{ refresh: () => void } | null>(null);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading) {
      if (!dbUser) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/dashboard');
      }
    }
  }, [dbUser, isAdmin, isLoading, router]);

  // Don't render anything if not authenticated, not admin, or still loading
  if (isLoading || !dbUser || !isAdmin) {
    return null;
  }

  return (
    <div>
      <TimesheetApprovalHeader
        statusFilter={statusFilter}
        onFilterChange={setStatusFilter}
        onRefresh={() => contentRef.current?.refresh()}
      />

      <Suspense fallback={<LoadingSkeleton />}>
        <TimesheetApprovalContent
          ref={contentRef}
          userId={dbUser.id}
          statusFilter={statusFilter}
        />
      </Suspense>
    </div>
  );
}
