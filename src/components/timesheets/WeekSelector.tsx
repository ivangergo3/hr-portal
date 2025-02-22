'use client';

import React from 'react';
import { format, addWeeks, subWeeks } from 'date-fns';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { useRouter } from 'next/navigation';

type WeekSelectorProps = {
  weekStart: Date;
  onLoadingChange: (loading: boolean) => void;
};

export function WeekSelector({
  weekStart,
  onLoadingChange,
}: WeekSelectorProps) {
  const router = useRouter();

  const handleWeekChange = (newWeek: Date) => {
    onLoadingChange(true);
    const params = new URLSearchParams();
    params.set('week', newWeek.toISOString());
    router.push(`/timesheets?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-4 mt-4">
      <button
        onClick={() => handleWeekChange(subWeeks(weekStart, 1))}
        className="p-2 hover:bg-slate-100 rounded-full text-slate-900"
      >
        <LuChevronLeft className="w-5 h-5" />
      </button>
      <span className="text-sm font-medium text-slate-900">
        Week of {format(weekStart, 'MMMM d, yyyy')}
      </span>
      <button
        onClick={() => handleWeekChange(addWeeks(weekStart, 1))}
        className="p-2 hover:bg-slate-100 rounded-full text-slate-900"
      >
        <LuChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
