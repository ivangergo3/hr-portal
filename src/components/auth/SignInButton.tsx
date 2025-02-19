'use client';

import { useState } from 'react';
import { LuLoader } from 'react-icons/lu';
import { createClient } from '@/utils/supabase/client';
export default function SignInButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('[SignIn] OAuth error:', error.message);
        setError('Failed to initiate sign in. Please try again.');
        return;
      }
    } catch (error) {
      console.error('[SignIn] Unexpected error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handleSignIn}
        disabled={isLoading}
        className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <LuLoader className="h-4 w-4 animate-spin" />
        ) : (
          'Sign in with Google'
        )}
      </button>

      {error && (
        <p className="text-sm text-red-600 text-center max-w-sm">{error}</p>
      )}
    </div>
  );
}
