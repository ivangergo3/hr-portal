'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { Project } from '@/types/database.types';
import { createClient } from '@/utils/supabase/client';
import { DataTable } from '@/components/common/DataTable';
import { createColumns } from './ProjectColumns';
import { toast } from 'sonner';

export const ProjectsContent = forwardRef<
  { refresh: () => void },
  { showArchived: boolean }
>(({ showArchived }, ref) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*, clients(*)')
        .eq('archived', showArchived)
        .order('name');

      if (error) throw error;

      // Preprocess data to add virtual fields for search
      const processedData = (data || []).map((project) => ({
        ...project,
        client_name: project.clients?.name || '', // Add virtual field for client name search
      }));

      setProjects(processedData);
    } catch (error) {
      console.error('[Projects] Fetch error:', error);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [showArchived]);

  useImperativeHandle(ref, () => ({
    refresh: fetchProjects,
  }));

  // Create columns with the refresh function
  const columns = createColumns(showArchived, fetchProjects);

  return (
    <>
      <DataTable
        columns={columns}
        data={projects}
        isLoading={isLoading}
        filterPlaceholder="Filter projects..."
        defaultVisibility={{
          updatedAt: false,
          archived: false,
          archivedAt: false,
        }}
      />
    </>
  );
});

ProjectsContent.displayName = 'ProjectsContent';
