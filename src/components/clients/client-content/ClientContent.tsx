'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { Client } from '@/types/database.types';
import { createClient } from '@/utils/supabase/client';
import { DataTable } from '@/components/common/DataTable';
import { createColumns } from './ClientColumns';
import { toast } from 'sonner';

export const ClientsContent = forwardRef<
  { refresh: () => void },
  { showArchived: boolean }
>(({ showArchived }, ref) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('archived', showArchived)
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('[Clients] Fetch error:', error);
      toast.error('Failed to load clients');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [showArchived]);

  useImperativeHandle(ref, () => ({
    refresh: fetchClients,
  }));

  // Create columns with the refresh function
  const columns = createColumns(showArchived, fetchClients);

  return (
    <>
      <DataTable
        columns={columns}
        data={clients}
        isLoading={isLoading}
        filterPlaceholder="Filter clients ..."
        defaultVisibility={{
          updatedAt: false,
          archived: false,
          archivedAt: false,
        }}
      />
    </>
  );
});

ClientsContent.displayName = 'ClientsContent';
