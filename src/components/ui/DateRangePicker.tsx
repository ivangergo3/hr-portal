'use client';

import React from 'react';
import { format } from 'date-fns';
import { LuCalendar } from 'react-icons/lu';

type DateRangePickerProps = {
  from: Date;
  to: Date;
  onChange: (range: { from: Date; to: Date }) => void;
};

export function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <input
          type="date"
          value={format(from, 'yyyy-MM-dd')}
          onChange={(e) => onChange({ from: new Date(e.target.value), to })}
          className="pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
        />
        <LuCalendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
      </div>
      <span className="text-slate-500">to</span>
      <div className="relative">
        <input
          type="date"
          value={format(to, 'yyyy-MM-dd')}
          onChange={(e) => onChange({ from, to: new Date(e.target.value) })}
          min={format(from, 'yyyy-MM-dd')}
          className="pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
        />
        <LuCalendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
      </div>
    </div>
  );
}
