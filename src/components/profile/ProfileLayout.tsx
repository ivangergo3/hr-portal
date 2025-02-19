'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { LoadingOverlay } from '@/components/common/LoadingOverlay';
import type { User } from '@/types/database.types';

type ProfileLayoutProps = {
  user: User;
};

export function ProfileLayout({ user }: ProfileLayoutProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const handleSuccess = () => {
    setIsLoading(true);
    router.refresh();
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoad(false), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setIsLoading(false);
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
        </div>
      </header>

      <div className="mt-6 px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {(isLoading || isInitialLoad) && <LoadingOverlay />}
          <ProfileForm
            user={user}
            initialProfile={user}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </div>
  );
}
