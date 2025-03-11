'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import LoginHeader from './LoginHeader';
import GoogleLoginButton from './GoogleLoginButton';
import EmailPasswordLoginForm from './EmailPasswordLoginForm';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { PageTransitionLoader } from '@/components/common/PageTransitionLoader';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginWrapper() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { error: authError } = useAuth();
  const lastDisplayedErrorRef = useRef<string | null>(null);

  // Centralized error handling for auth errors
  useEffect(() => {
    if (authError && authError !== lastDisplayedErrorRef.current) {
      toast.error(authError);
      lastDisplayedErrorRef.current = authError;
    } else if (!authError) {
      lastDisplayedErrorRef.current = null;
    }
  }, [authError]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);

        // Check if we're returning from Google auth
        const googleAuthInProgress = localStorage.getItem(
          'googleAuthInProgress',
        );
        if (googleAuthInProgress) {
          // Clear the flag
          localStorage.removeItem('googleAuthInProgress');
          console.log('[LoginWrapper] Returning from Google auth flow');

          // Set loading state to indicate we're processing the auth
          setIsAuthLoading(true);

          // Give a moment for the auth to complete
          setTimeout(async () => {
            // Check if we have a session now
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData.session) {
              console.log(
                '[LoginWrapper] Successfully authenticated with Google',
              );
              router.push('/dashboard');
              return;
            } else {
              console.log(
                '[LoginWrapper] No session after Google auth, showing login form',
              );
              setIsAuthLoading(false);
            }
          }, 1000);
        }

        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[LoginWrapper] Session error:', error.message);
          toast.error('Failed to check authentication status');
          return;
        }

        if (data.session) {
          router.push('/dashboard');
          return;
        }
      } catch (err) {
        console.error('[LoginWrapper] Error:', err);
        toast.error('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router, supabase.auth]);

  // Show loading state while checking session or during authentication
  if (isLoading || isAuthLoading) {
    return <PageTransitionLoader manualLoading={true} />;
  }

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <LoginHeader />

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <EmailPasswordLoginForm
                isLoading={isAuthLoading}
                setIsLoading={setIsAuthLoading}
              />
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <GoogleLoginButton
                isLoading={isAuthLoading}
                setIsLoading={setIsAuthLoading}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
