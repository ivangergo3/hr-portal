'use client';

import { useState } from 'react';
import { LuArchive } from 'react-icons/lu';
import { NewConfirmDialog } from '@/components/common/NewConfirmDialog';
import { createClient } from '@/utils/supabase/client';
import { Row } from '@tanstack/react-table';
import { Project } from '@/types/database.types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export const ActionCell = ({
  row,
  showArchived,
  onSuccess,
}: {
  row: Row<Project>;
  showArchived: boolean;
  onSuccess: () => void;
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const project = row.original;
  const supabase = createClient();

  const handleArchive = async () => {
    try {
      setIsProcessing(true);
      const { error } = await supabase
        .from('projects')
        .update({
          archived: !showArchived,
          archived_at: !showArchived
            ? new Date().toISOString()
            : project.archived_at,
        })
        .eq('id', project.id);

      if (error) throw error;

      onSuccess();
      toast.success(
        `Project ${!showArchived ? 'archived' : 'unarchived'} successfully`,
      );
    } catch (error) {
      console.error('[Projects] Archive error:', error);
      toast.error('Failed to archive project');
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
            data-testid={`table-row-${project.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${showArchived ? 'unarchive' : 'archive'}-button`}
          >
            <LuArchive className="h-4 w-4" />
          </Button>
        }
        icon={<LuArchive className="h-4 w-4" />}
        onConfirm={handleArchive}
        title={showArchived ? 'Unarchive Project' : 'Archive Project'}
        message={`Are you sure you want to ${
          showArchived ? 'unarchive' : 'archive'
        } ${project.name}?`}
        isLoading={isProcessing}
      />
    </div>
  );
};
