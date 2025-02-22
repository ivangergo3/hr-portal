'use client';

import React from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { LuArchive, LuUndo } from 'react-icons/lu';
import type { Client } from '@/types/database.types';
import { createClient } from '@/utils/supabase/client';
type ClientsTableProps = {
  clients: Client[];
  showArchived: boolean;
  onAction: () => void;
};

export function ClientsTable({
  clients,
  showArchived,
  onAction,
}: ClientsTableProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleArchiveToggle = async (client: Client) => {
    try {
      onAction();
      const { error } = await supabase
        .from('clients')
        .update({
          archived: !client.archived,
          archived_at: !client.archived ? new Date().toISOString() : null,
        })
        .eq('id', client.id);

      if (error) throw error;
      router.refresh();
    } catch (error) {
      console.error('[ClientsTable] Archive toggle error:', error);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Created
              </th>
              {showArchived && (
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Archived
                </th>
              )}
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                  {client.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                  {format(new Date(client.created_at), 'MMM d, yyyy')}
                </td>
                {showArchived && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {client.archived_at
                      ? format(new Date(client.archived_at), 'MMM d, yyyy')
                      : 'N/A'}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <button
                    onClick={() => handleArchiveToggle(client)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    {client.archived ? (
                      <LuUndo className="h-5 w-5" />
                    ) : (
                      <LuArchive className="h-5 w-5" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
