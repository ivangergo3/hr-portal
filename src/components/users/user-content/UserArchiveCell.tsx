'use client';

import { useState } from 'react';
import { LuArchive } from 'react-icons/lu';
import { NewConfirmDialog } from '@/components/common/NewConfirmDialog';
import { createClient } from '@/utils/supabase/client';
import { Row } from '@tanstack/react-table';
import { User } from '@/types/database.types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export const ActionCell = ({
  row,
  showArchived,
  onSuccess,
}: {
  row: Row<User>;
  showArchived: boolean;
  onSuccess: () => void;
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const user = row.original;
  const supabase = createClient();

  const handleArchive = async () => {
    try {
      setIsProcessing(true);
      const { error } = await supabase
        .from('users')
        .update({
          archived: !showArchived,
          archived_at: !showArchived
            ? new Date().toISOString()
            : user.archived_at,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Update error:', error);
        throw error;
      }

      onSuccess();
      toast.success(
        `User ${!showArchived ? 'archived' : 'unarchived'} successfully`,
      );
    } catch (error) {
      console.error('[Users] Archive error:', error);
      toast.error('Failed to archive user');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex justify-center">
      <NewConfirmDialog
        trigger={
          <Button
            variant="ghost"
            className="text-slate-400 hover:text-slate-500"
            data-testid="archive-button"
          >
            <LuArchive className="h-4 w-4" />
          </Button>
        }
        icon={<LuArchive className="h-4 w-4" />}
        onConfirm={handleArchive}
        title={showArchived ? 'Unarchive User' : 'Archive User'}
        message={`Are you sure you want to ${
          showArchived ? 'unarchive' : 'archive'
        } ${user.email}?`}
        isLoading={isProcessing}
      />
    </div>
  );
};
