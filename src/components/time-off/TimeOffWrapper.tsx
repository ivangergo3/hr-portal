'use client';

import { useState, useRef, useEffect } from 'react';
import { Suspense } from 'react';
import { TimeOffHeader } from './NewTimeOffHeader';
import { TimeOffContent } from './time-off-content/TimeOffContent';
import LoadingSkeleton from '../common/LoadingSkeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export function TimeOffWrapper() {
  const { dbUser, isLoading } = useAuth();
  const router = useRouter();
  const [showPending, setShowPending] = useState(true);
  const contentRef = useRef<{ refresh: () => void } | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !dbUser) {
      router.push('/login');
    }
  }, [dbUser, isLoading, router]);

  // Don't render anything if not authenticated or still loading
  if (isLoading || !dbUser) {
    return null;
  }

  return (
    <div>
      <TimeOffHeader
        showPending={showPending}
        onToggleView={() => setShowPending(!showPending)}
        onRefresh={() => contentRef.current?.refresh()}
      />

      <Suspense fallback={<LoadingSkeleton />}>
        <TimeOffContent
          ref={contentRef}
          userId={dbUser.id}
          showPending={showPending}
        />
      </Suspense>
    </div>
  );
}
