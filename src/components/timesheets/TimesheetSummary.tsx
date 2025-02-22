'use client';

import { useState, useEffect } from 'react';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';

export default function TimesheetSummary(
  {
    /* ... */
  },
) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSkeleton rows={2} columns={3} />;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {/* ... existing JSX */}
    </div>
  );
}
