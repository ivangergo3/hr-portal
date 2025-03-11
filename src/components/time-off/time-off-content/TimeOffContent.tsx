'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { TimeOffRequestWithUser } from '@/types/database.types';
import { createClient } from '@/utils/supabase/client';
import { DataTable } from '@/components/common/DataTable';
import { columns } from './TimeOffColumns';
import { toast } from 'sonner';

export const TimeOffContent = forwardRef<
  { refresh: () => void },
  { userId: string; showPending?: boolean }
>(({ userId, showPending = true }, ref) => {
  const [requests, setRequests] = useState<TimeOffRequestWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('time_off_requests')
        .select(
          `
          *,
          user:users (
            id,
            email,
            role
          )
        `,
        )
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter based on showPending if needed
      const filteredData = showPending
        ? data?.filter((req) => req.status === 'submitted')
        : data?.filter((req) => req.status !== 'submitted');

      setRequests(filteredData || []);
    } catch (error) {
      console.error('[TimeOff] Fetch error:', error);
      toast.error('Failed to load time off requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [showPending]);

  useImperativeHandle(ref, () => ({
    refresh: fetchRequests,
  }));

  return (
    <>
      <DataTable
        columns={columns}
        data={requests}
        isLoading={isLoading}
        filterPlaceholder="Filter time off requests..."
        defaultVisibility={{
          'user.full_name': userId !== 'admin',
        }}
      />
    </>
  );
});

TimeOffContent.displayName = 'TimeOffContent';
