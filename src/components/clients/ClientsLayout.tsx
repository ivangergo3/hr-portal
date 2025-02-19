'use client';

import React, { useState, useEffect } from 'react';
import { ClientsTable } from '@/components/clients/ClientsTable';
import { AddClientModal } from '@/components/clients/AddClientModal';
import { LoadingOverlay } from '@/components/common/LoadingOverlay';
import type { Client } from '@/types/database.types';
import { LuPlus } from 'react-icons/lu';

type ClientsLayoutProps = {
  clients: Client[];
};

export function ClientsLayout({ clients }: ClientsLayoutProps) {
  const [showArchived, setShowArchived] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const filteredClients = clients.filter(
    (client) => client.archived === showArchived,
  );

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoad(false), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setIsLoading(false);
  }, [clients]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-slate-900">Clients</h1>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              <LuPlus className="h-4 w-4" />
              Add Client
            </button>
          </div>
          <div className="mt-4">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`text-sm font-medium ${
                showArchived
                  ? 'text-slate-900'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {showArchived
                ? '← Back to Active Clients'
                : 'Show Archived Clients'}
            </button>
          </div>
        </div>
      </header>

      <div className="mt-6 px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {(isLoading || isInitialLoad) && <LoadingOverlay />}
          <ClientsTable
            clients={filteredClients}
            showArchived={showArchived}
            onAction={() => setIsLoading(true)}
          />
        </div>
      </div>

      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsLoading(true);
          setIsAddModalOpen(false);
        }}
      />
    </div>
  );
}
