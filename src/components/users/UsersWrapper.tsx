'use client';

import { useState, useRef } from 'react';
import { Suspense } from 'react';
import { UsersHeader } from './UsersHeader';
import { UsersContent } from './user-content/UserContent';
import LoadingSkeleton from '../common/LoadingSkeleton';

export function UsersWrapper() {
  const [showArchived, setShowArchived] = useState(false);
  const contentRef = useRef<{ refresh: () => void } | null>(null);

  return (
    <div>
      <UsersHeader
        showArchived={showArchived}
        onToggleArchived={() => setShowArchived(!showArchived)}
        onRefresh={() => contentRef.current?.refresh()}
      />

      <Suspense fallback={<LoadingSkeleton />}>
        <UsersContent ref={contentRef} showArchived={showArchived} />
      </Suspense>
    </div>
  );
}
