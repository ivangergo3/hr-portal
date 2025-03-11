'use client';

import { useState, useRef } from 'react';
import { Suspense } from 'react';
import { ProjectsHeader } from './ProjectsHeader';
import { ProjectsContent } from './project-content/ProjectContent';
import LoadingSkeleton from '../common/LoadingSkeleton';

export function ProjectsWrapper() {
  const [showArchived, setShowArchived] = useState(false);
  const contentRef = useRef<{ refresh: () => void } | null>(null);

  return (
    <div>
      <ProjectsHeader
        showArchived={showArchived}
        onToggleArchived={() => setShowArchived(!showArchived)}
        onRefresh={() => contentRef.current?.refresh()}
      />

      <Suspense fallback={<LoadingSkeleton />}>
        <ProjectsContent ref={contentRef} showArchived={showArchived} />
      </Suspense>
    </div>
  );
}
