import { useState } from 'react';
import { User, TimeOffStatus } from '@/types/database.types';
import {
  validateTimeOff,
  validateRequired,
  validateLength,
  LIMITS,
} from '@/utils/validation';
import { withRetry } from '@/utils/apiRetry';
import { createClient } from '@/utils/supabase/client';

interface TimeOffFormProps {
  user: User;
  onSuccess: () => void;
}

export default function TimeOffForm({ user, onSuccess }: TimeOffFormProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    const reasonError = validateRequired(reason, 'Reason');
    if (reasonError) {
      setError(reasonError);
      return;
    }

    // Validate reason length
    const lengthError = validateLength(
      reason,
      'Reason',
      LIMITS.MAX_REASON_LENGTH,
    );
    if (lengthError) {
      setError(lengthError);
      return;
    }

    // Validate dates
    const dateError = validateTimeOff(startDate, endDate);
    if (dateError) {
      setError(dateError);
      return;
    }

    try {
      setIsSubmitting(true);
      const supabase = createClient();

      await withRetry(
        async () => {
          const { error: submitError } = await supabase
            .from('time_off_requests')
            .insert({
              user_id: user.id,
              start_date: startDate,
              end_date: endDate,
              reason,
              status: 'pending' as TimeOffStatus,
            });
          if (submitError) throw submitError;
          return true;
        },
        { maxAttempts: 3, delayMs: 1000 },
      );

      setStartDate('');
      setEndDate('');
      setReason('');
      onSuccess();
    } catch (error) {
      console.error('[TimeOffForm] Submit error:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to submit request. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="start_date"
            className="block text-sm font-medium text-gray-700"
          >
            Start Date
          </label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            required
            min={new Date().toISOString().split('T')[0]}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="end_date"
            className="block text-sm font-medium text-gray-700"
          >
            End Date
          </label>
          <input
            type="date"
            id="end_date"
            name="end_date"
            required
            min={startDate || new Date().toISOString().split('T')[0]}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="reason"
          className="block text-sm font-medium text-gray-700"
        >
          Reason
        </label>
        <textarea
          id="reason"
          name="reason"
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
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

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
}
