'use client';

import { Skeleton } from '../ui/skeleton';

interface LoadingSkeletonProps {
  rows?: number;
  columns?: number;
}

export default function LoadingSkeleton({
  rows = 5,
  columns = 3,
}: LoadingSkeletonProps) {
  return (
    <div className="animate-pulse" data-testid="loading-skeleton">
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex space-x-4">
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={j} className="h-6 bg-slate-200 rounded flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
