'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LuShieldAlert } from 'react-icons/lu';
import { useAuth } from '@/contexts/AuthContext';
import { PageTransitionLoader } from '../common/PageTransitionLoader';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, isAdmin, isLoading, error, isPageLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/dashboard');
      }
    }
  }, [user, isAdmin, isLoading, router]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <LuShieldAlert className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">{error}</h3>
        </div>
      </div>
    );
  }

  if (isLoading || isPageLoading) {
    return <PageTransitionLoader manualLoading={true} />;
  }

  if (!user || !isAdmin) {
    return <PageTransitionLoader manualLoading={true} />;
  }

  return <>{children}</>;
}
