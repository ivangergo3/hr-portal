'use client';

import { useState } from 'react';
import { Row } from '@tanstack/react-table';
import { User, Role } from '@/types/database.types';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const RoleCell = ({
  row,
  onSuccess,
}: {
  row: Row<User>;
  onSuccess: () => void;
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const user = row.original;
  const supabase = createClient();

  const handleRoleChange = async (newRole: string) => {
    if (newRole === user.role) return;

    try {
      setIsUpdating(true);

      const { error } = await supabase
        .from('users')
        .update({
          role: newRole as Role,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('Update error:', error);
        throw error;
      }

      onSuccess();
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      console.error('[Users] Role update error:', error);
      toast.error('Failed to update user role');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="text-center">
      <Select
        defaultValue={user.role}
        onValueChange={handleRoleChange}
        disabled={isUpdating}
      >
        <SelectTrigger className="w-[130px]" data-testid="role-select">
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin" data-testid="role-option-admin">
            Admin
          </SelectItem>
          <SelectItem value="employee" data-testid="role-option-employee">
            Employee
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
