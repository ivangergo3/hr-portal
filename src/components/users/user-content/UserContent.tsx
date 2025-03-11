'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { User } from '@/types/database.types';
import { createClient } from '@/utils/supabase/client';
import { DataTable } from '@/components/common/DataTable';
import { createColumns } from './UserColumns';
import { toast } from 'sonner';

export const UsersContent = forwardRef<
  { refresh: () => void },
  { showArchived: boolean }
>(({ showArchived }, ref) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('archived', showArchived)
        .order('email');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('[Users] Fetch error:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [showArchived]);

  useImperativeHandle(ref, () => ({
    refresh: fetchUsers,
  }));

  // Create columns with the refresh function
  const columns = createColumns(showArchived, fetchUsers);

  return (
    <>
      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        filterPlaceholder="Filter users..."
        defaultVisibility={{
          updatedAt: false,
          archived: false,
          archivedAt: false,
        }}
      />
    </>
  );
});

UsersContent.displayName = 'UsersContent';
