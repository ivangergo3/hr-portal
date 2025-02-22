'use client';

import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { LuLoader, LuShieldAlert } from 'react-icons/lu';
import { createClient } from '@/utils/supabase/client';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          console.error('[AuthGuard] Auth error:', authError.message);
          setError('Unable to verify authentication');
          return;
        }

        setIsAuthenticated(!!user);
      } catch (error) {
        console.error('[AuthGuard] Check error:', error);
        setError('An unexpected error occurred');
      }
    };

    checkAuth();
  }, [supabase]);

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

  if (isAuthenticated === null) {
    return (
      <div className="flex h-full items-center justify-center">
        <LuLoader className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    redirect('/');
  }

  return <>{children}</>;
}
