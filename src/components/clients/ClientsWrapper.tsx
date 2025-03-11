'use client';

import { useState, useRef } from 'react';
import { Suspense } from 'react';
import { ClientsHeader } from './ClientsHeader';
import { ClientsContent } from './client-content/ClientContent';
import LoadingSkeleton from '../common/LoadingSkeleton';

export function ClientsWrapper() {
  const [showArchived, setShowArchived] = useState(false);
  const contentRef = useRef<{ refresh: () => void } | null>(null);

  return (
    <div>
      <ClientsHeader
        showArchived={showArchived}
        onToggleArchived={() => setShowArchived(!showArchived)}
        onRefresh={() => contentRef.current?.refresh()}
      />

      <Suspense fallback={<LoadingSkeleton />}>
        <ClientsContent ref={contentRef} showArchived={showArchived} />
      </Suspense>
    </div>
  );
}
