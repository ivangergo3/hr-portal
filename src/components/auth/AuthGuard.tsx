'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LuShieldAlert } from 'react-icons/lu';
import { useAuth } from '@/contexts/AuthContext';
import { PageTransitionLoader } from '../common/PageTransitionLoader';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading, error, isPageLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

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

  if (!user) {
    return <PageTransitionLoader manualLoading={true} />;
  }

  return <>{children}</>;
}
