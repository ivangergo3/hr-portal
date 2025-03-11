'use client';

import { useState } from 'react';
import { LuArchive } from 'react-icons/lu';
import { NewConfirmDialog } from '@/components/common/NewConfirmDialog';
import { createClient } from '@/utils/supabase/client';
import { Row } from '@tanstack/react-table';
import { Client } from '@/types/database.types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export const ActionCell = ({
  row,
  showArchived,
  onSuccess,
}: {
  row: Row<Client>;
  showArchived: boolean;
  onSuccess: () => void;
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const client = row.original;
  const supabase = createClient();

  const handleArchive = async () => {
    try {
      setIsProcessing(true);
      const { error } = await supabase
        .from('clients')
        .update({
          archived: !showArchived,
          archived_at: !showArchived
            ? new Date().toISOString()
            : client.archived_at,
        })
        .eq('id', client.id);

      if (error) throw error;

      onSuccess();
      toast.success(
        `Client ${!showArchived ? 'archived' : 'unarchived'} successfully`,
      );
    } catch (error) {
      console.error('[Clients] Archive error:', error);
      toast.error(
        `Failed to ${!showArchived ? 'archive' : 'unarchive'} client`,
      );
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
            data-testid={`table-row-${client.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${showArchived ? 'unarchive' : 'archive'}-button`}
          >
            <LuArchive className="h-4 w-4" />
          </Button>
        }
        icon={<LuArchive className="h-4 w-4" />}
        onConfirm={handleArchive}
        title={showArchived ? 'Unarchive Client' : 'Archive Client'}
        message={`Are you sure you want to ${
          showArchived ? 'unarchive' : 'archive'
        } ${client.name}?`}
        isLoading={isProcessing}
      />
    </div>
  );
};
