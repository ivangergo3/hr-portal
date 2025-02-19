'use client';

import { useState, useEffect } from 'react';
import { Timesheet, ApiResponse } from '@/types/database.types';
import { validateHours, PATTERNS, LIMITS } from '@/utils/validation';
import { withRetry } from '@/utils/apiRetry';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import EmptyState from '@/components/common/EmptyState';
import { createClient } from '@/utils/supabase/client';

type TimesheetResponse = ApiResponse<{ id: string }>;

interface TimesheetEntryProps {
  timesheet: Timesheet;
  onUpdate: () => void;
  isDisabled?: boolean;
}

export default function TimesheetEntry({
  timesheet,
  onUpdate,
  isDisabled = false,
}: TimesheetEntryProps) {
  const [hours, setHours] = useState({
    monday: timesheet.monday_hours.toString(),
    tuesday: timesheet.tuesday_hours.toString(),
    wednesday: timesheet.wednesday_hours.toString(),
    thursday: timesheet.thursday_hours.toString(),
    friday: timesheet.friday_hours.toString(),
    saturday: timesheet.saturday_hours.toString(),
    sunday: timesheet.sunday_hours.toString(),
  });
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const validateHourInput = (value: string): boolean => {
    if (!value) return true; // Allow empty for now
    return (
      PATTERNS.HOURS.test(value) && parseFloat(value) <= LIMITS.MAX_DAILY_HOURS
    );
  };

  const validateTotalHours = (): string | null => {
    return validateHours(hours);
  };

  const handleHourChange = (day: keyof typeof hours, value: string) => {
    if (value === '' || validateHourInput(value)) {
      setHours((prev) => ({ ...prev, [day]: value }));
      setError(null);
    }
  };

  const handleBlur = (day: keyof typeof hours) => {
    const value = hours[day];
    if (value === '') {
      setHours((prev) => ({ ...prev, [day]: '0' }));
    } else {
      // Format to 2 decimal places if needed
      const formatted = parseFloat(value).toFixed(2);
      setHours((prev) => ({ ...prev, [day]: formatted }));
    }
  };

  const handleSubmit = async () => {
    const validationError = validateTotalHours();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsUpdating(true);
      setError(null);
      const supabase = createClient();

      await withRetry(
        async () => {
          const { error: updateError } = (await supabase
            .from('timesheets')
            .update({
              monday_hours: parseFloat(hours.monday) || 0,
              tuesday_hours: parseFloat(hours.tuesday) || 0,
              wednesday_hours: parseFloat(hours.wednesday) || 0,
              thursday_hours: parseFloat(hours.thursday) || 0,
              friday_hours: parseFloat(hours.friday) || 0,
              saturday_hours: parseFloat(hours.saturday) || 0,
              sunday_hours: parseFloat(hours.sunday) || 0,
              updated_at: new Date().toISOString(),
            })
            .eq('id', timesheet.id)) as TimesheetResponse;

          if (updateError) throw updateError;
          return true;
        },
        {
          maxAttempts: 3,
          delayMs: 1000,
          backoff: true,
        },
      );

      onUpdate();
    } catch (error) {
      console.error('[TimesheetEntry] Update error:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to update hours. Please try again.',
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Auto-save when hours change (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isDisabled && !error) {
        handleSubmit();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [hours]);

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSkeleton rows={7} columns={2} />;
  }

  if (!timesheet) {
    return (
      <EmptyState
        title="No timesheet found"
        message="There is no timesheet data for this period."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-2">
        {Object.entries(hours).map(([day, value]) => (
          <div key={day}>
            <label
              htmlFor={day}
              className="block text-sm font-medium text-gray-700 capitalize"
            >
              {day}
            </label>
            <input
              type="text"
              id={day}
              value={value}
              onChange={(e) =>
                handleHourChange(day as keyof typeof hours, e.target.value)
              }
              onBlur={() => handleBlur(day as keyof typeof hours)}
              disabled={isDisabled || isUpdating}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100"
              placeholder="0"
            />
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
