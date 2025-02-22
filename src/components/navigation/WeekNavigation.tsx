'use client';

import { format, addWeeks, startOfWeek } from 'date-fns';
import { LuChevronLeft, LuChevronRight, LuLoader } from 'react-icons/lu';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface WeekNavigationProps {
  currentWeek: Date;
}

export default function WeekNavigation({ currentWeek }: WeekNavigationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWeekChange = async (direction: 'prev' | 'next') => {
    try {
      setIsNavigating(true);
      setError(null);

      const newWeek = startOfWeek(
        addWeeks(currentWeek, direction === 'next' ? 1 : -1),
        { weekStartsOn: 1 },
      );

      const params = new URLSearchParams(searchParams.toString());
      params.set('week', newWeek.toISOString());
      router.push(`?${params.toString()}`);
    } catch (error) {
      console.error('[WeekNavigation] Navigation error:', error);
      setError('Failed to change week');
    } finally {
      setIsNavigating(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => handleWeekChange('prev')}
        disabled={isNavigating}
        className="rounded-md p-1 hover:bg-slate-100 disabled:opacity-50"
      >
        <LuChevronLeft className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2">
        {isNavigating ? (
          <LuLoader className="h-4 w-4 animate-spin" />
        ) : (
          <span className="text-sm font-medium">
            Week of {format(currentWeek, 'MMM d, yyyy')}
          </span>
        )}
      </div>

      <button
        onClick={() => handleWeekChange('next')}
        disabled={isNavigating}
        className="rounded-md p-1 hover:bg-slate-100 disabled:opacity-50"
      >
        <LuChevronRight className="h-5 w-5" />
      </button>

      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
}
