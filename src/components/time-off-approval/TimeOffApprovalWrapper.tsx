'use client';

import { useState, useRef, useEffect } from 'react';
import { Suspense } from 'react';
import { TimeOffApprovalHeader } from './TimeOffApprovalHeader';
import { TimeOffApprovalContent } from './time-off-approval-content/TimeOffApprovalContent';
import LoadingSkeleton from '../common/LoadingSkeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export function TimeOffApprovalWrapper() {
  const { dbUser, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'submitted' | 'approved' | 'rejected'
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
      <TimeOffApprovalHeader
        statusFilter={statusFilter}
        onFilterChange={setStatusFilter}
        onRefresh={() => contentRef.current?.refresh()}
      />

      <Suspense fallback={<LoadingSkeleton />}>
        <TimeOffApprovalContent
          ref={contentRef}
          userId={dbUser.id}
          statusFilter={statusFilter}
        />
      </Suspense>
    </div>
  );
}
