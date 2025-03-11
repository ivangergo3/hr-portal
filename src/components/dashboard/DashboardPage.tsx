'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { dbUser, isLoading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !dbUser) {
      router.push('/login');
    }
  }, [dbUser, isLoading, router]);

  // Don't render anything if not authenticated or still loading
  if (isLoading || !dbUser) {
    return null;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-4 text-slate-900">
        Welcome, {dbUser.full_name || dbUser.email}
      </h1>
      <p className="text-gray-600">
        Select an option from the sidebar to get started.
      </p>
    </div>
  );
}
