'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { Client } from '@/types/database.types';
import { format } from 'date-fns';
import { LuArchive } from 'react-icons/lu';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Notification from '@/components/common/Notification';
import { AddClientModal } from './AddClientModal';
import { createClient } from '@/utils/supabase/client';

export const ClientsContent = forwardRef<
  { refresh: () => void },
  { showArchived: boolean }
>(({ showArchived }, ref) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
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
      setNotification({
        message: 'Failed to load clients',
        type: 'error',
      });
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

  const handleArchive = async () => {
    if (!selectedClient) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('clients')
        .update({ archived: !showArchived })
        .eq('id', selectedClient.id);

      if (error) throw error;

      setClients(clients.filter((c) => c.id !== selectedClient.id));
      setNotification({
        message: `Client ${
          showArchived ? 'unarchived' : 'archived'
        } successfully`,
        type: 'success',
      });
    } catch (error) {
      console.error('[Clients] Archive error:', error);
      setNotification({
        message: 'Failed to update client',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
      setSelectedClient(null);
    }
  };

  const refreshData = () => {
    fetchClients();
  };

  return (
    <div className="mt-6 px-4 sm:px-6 lg:px-8">
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-slate-600 animate-bounce [animation-delay:-0.3s]" />
              <div className="w-4 h-4 rounded-full bg-slate-600 animate-bounce [animation-delay:-0.15s]" />
              <div className="w-4 h-4 rounded-full bg-slate-600 animate-bounce" />
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
                >
                  Created
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {clients.map((client) => (
                <tr key={client.id}>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-900">
                    {client.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                    {format(new Date(client.created_at), 'MMM d, yyyy')}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedClient(client);
                          setShowConfirm(true);
                        }}
                        className="text-slate-400 hover:text-slate-500"
                      >
                        <LuArchive className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setSelectedClient(null);
        }}
        onConfirm={handleArchive}
        title={showArchived ? 'Unarchive Client' : 'Archive Client'}
        message={`Are you sure you want to ${
          showArchived ? 'unarchive' : 'archive'
        } ${selectedClient?.name}?`}
      />

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <AddClientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={refreshData}
      />
    </div>
  );
});

ClientsContent.displayName = 'ClientsContent';
