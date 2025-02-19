'use client';

import { useState, useRef } from 'react';
import { Suspense } from 'react';
import { ProjectsHeader } from './ProjectsHeader';
import { ProjectsContent } from './ProjectsContent';

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
      <Suspense
        fallback={
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="relative min-h-[200px]">
              <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-slate-600 animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-4 h-4 rounded-full bg-slate-600 animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-4 h-4 rounded-full bg-slate-600 animate-bounce" />
                </div>
              </div>
            </div>
          </div>
        }
      >
        <ProjectsContent ref={contentRef} showArchived={showArchived} />
      </Suspense>
    </div>
  );
}
