'use client';

import { startOfWeek } from 'date-fns';
import { LuChevronLeft, LuChevronRight, LuCalendar } from 'react-icons/lu';
import { useState, useEffect } from 'react';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';

interface WeekNavigationProps {
  currentWeek: Date;
  onWeekChange: (newWeek: Date) => void;
}

export default function WeekNavigation({
  currentWeek,
  onWeekChange,
}: WeekNavigationProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSkeleton rows={1} columns={3} />;
  }

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    onWeekChange(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    onWeekChange(newDate);
  };

  const goToCurrentWeek = () => {
    const today = new Date();
    const thisWeek = startOfWeek(today, { weekStartsOn: 1 });
    onWeekChange(thisWeek);
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <button
          onClick={goToPreviousWeek}
          className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
        >
          <LuChevronLeft className="h-4 w-4" />
          Previous Week
        </button>
        <button
          onClick={goToCurrentWeek}
          className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
        >
          <LuCalendar className="h-4 w-4 mr-2" />
          Current Week
        </button>
        <button
          onClick={goToNextWeek}
          className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
        >
          Next Week
          <LuChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
