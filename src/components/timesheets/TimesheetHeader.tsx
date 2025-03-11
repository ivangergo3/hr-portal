'use client';

import React from 'react';
import { WeekSelector } from './WeekSelector';
import { LuSave, LuSend } from 'react-icons/lu';
import { Button } from '@/components/ui/button';
import type { TimesheetStatus } from '@/types/database.types';

interface TimesheetHeaderProps {
  weekStart: Date;
  status: TimesheetStatus;
  onLoadingChange: (loading: boolean) => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function TimesheetHeader({
  weekStart,
  status,
  onLoadingChange,
  onSaveDraft,
  onSubmit,
  isLoading,
}: TimesheetHeaderProps) {
  return (
    <div className="bg-white shadow">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
          {/* Title */}
          <div className="col-span-1">
            <h1 className="text-2xl font-semibold text-slate-900">
              My Timesheet
            </h1>
          </div>

          {/* Week Selector */}
          <div className="col-span-1 flex justify-center">
            <WeekSelector
              weekStart={weekStart}
              onLoadingChange={onLoadingChange}
            />
          </div>

          {/* Status Badge */}
          <div className="col-span-1 flex justify-center">
            <span
              className={`inline-flex items-center rounded-md px-2.5 py-1 text-sm font-medium ${
                status === 'submitted'
                  ? 'bg-yellow-50 text-yellow-700'
                  : status === 'approved'
                    ? 'bg-green-50 text-green-700'
                    : status === 'rejected'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-slate-100 text-slate-700'
              }`}
              data-testid="timesheet-status-badge"
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="col-span-1 flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onSaveDraft}
              disabled={isLoading || status === 'approved'}
              data-testid="timesheet-save-draft-button"
            >
              <LuSave className="h-4 w-4" />
              Save Draft
            </Button>
            <Button
              variant="default"
              onClick={onSubmit}
              disabled={
                isLoading || status === 'submitted' || status === 'approved'
              }
              data-testid="timesheet-submit-button"
            >
              <LuSend className="h-4 w-4" />
              Submit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
