'use client';

import React from 'react';
import { format, addWeeks, subWeeks } from 'date-fns';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { Button } from '../ui/button';

type WeekSelectorProps = {
  weekStart: Date;
  onLoadingChange: (loading: boolean) => void;
};

export function WeekSelector({
  weekStart,
  onLoadingChange,
}: WeekSelectorProps) {
  // Create a form to submit for server-side navigation
  const createWeekForm = (newWeek: Date) => {
    const formId = `week-form-${newWeek.getTime()}`;

    return (
      <form
        id={formId}
        action="/timesheets"
        method="get"
        style={{ display: 'none' }}
      >
        <input type="hidden" name="week" value={newWeek.toISOString()} />
      </form>
    );
  };

  const submitForm = (newWeek: Date) => {
    onLoadingChange(true);
    const form = document.getElementById(
      `week-form-${newWeek.getTime()}`,
    ) as HTMLFormElement;
    if (form) {
      form.submit();
    }
  };

  return (
    <div className="flex items-center gap-4">
      {createWeekForm(subWeeks(weekStart, 1))}
      {createWeekForm(addWeeks(weekStart, 1))}

      <Button
        variant="ghost"
        onClick={() => submitForm(subWeeks(weekStart, 1))}
        className="p-2 hover:bg-slate-100 rounded-full text-slate-900"
        data-testid="timesheets-previous-week-button"
      >
        <LuChevronLeft className="w-5 h-5" />
      </Button>
      <span
        data-testid="timesheets-week-selector-week"
        className="text-sm font-medium text-slate-900"
      >
        Week of {format(weekStart, 'MMMM d, yyyy')}
      </span>
      <Button
        variant="ghost"
        onClick={() => submitForm(addWeeks(weekStart, 1))}
        className="p-2 hover:bg-slate-100 rounded-full text-slate-900"
        data-testid="timesheets-next-week-button"
      >
        <LuChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
}
