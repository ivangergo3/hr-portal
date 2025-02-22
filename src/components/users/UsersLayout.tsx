'use client';

import React, { useState, useEffect } from 'react';
import { UsersTable } from '@/components/users/UsersTable';
import { InviteUserModal } from '@/components/users/InviteUserModal';
import type { User } from '@/types/database.types';
import { LuUserPlus } from 'react-icons/lu';
import { useRouter } from 'next/navigation';
import { LoadingOverlay } from '@/components/common/LoadingOverlay';

type UsersLayoutProps = {
  users: User[];
};

export function UsersLayout({ users }: UsersLayoutProps) {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoad(false), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setIsLoading(false);
  }, [users]);

  const handleModalClose = () => {
    setIsLoading(true);
    setIsInviteModalOpen(false);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              <LuUserPlus className="h-4 w-4" />
              Invite User
            </button>
          </div>
        </div>
      </header>

      <div className="mt-6 px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {(isLoading || isInitialLoad) && <LoadingOverlay />}
          <UsersTable users={users} />
        </div>
      </div>

      <InviteUserModal isOpen={isInviteModalOpen} onClose={handleModalClose} />
    </div>
  );
}
