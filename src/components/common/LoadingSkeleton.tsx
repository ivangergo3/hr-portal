"use client";

interface LoadingSkeletonProps {
  rows?: number;
  columns?: number;
}

export default function LoadingSkeleton({
  rows = 3,
  columns = 3,
}: LoadingSkeletonProps) {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-1/4 bg-slate-200 rounded mb-6" />
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex space-x-4">
            {Array.from({ length: columns }).map((_, j) => (
              <div key={j} className="h-4 bg-slate-200 rounded flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
