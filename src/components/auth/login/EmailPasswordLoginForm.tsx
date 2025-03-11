'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateEmail, validatePassword } from '@/utils/validation';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function EmailPasswordLoginForm({
  isLoading: externalIsLoading,
  setIsLoading: setExternalIsLoading,
}: {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading: authIsLoading } = useAuth();

  // Combine external loading state with auth context loading state
  const isLoading = externalIsLoading || authIsLoading;

  const validateForm = () => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError) {
      toast.error(emailError);
    }

    if (passwordError) {
      toast.error(passwordError);
    }

    return !emailError && !passwordError;
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Set external loading state
      setExternalIsLoading(true);
      console.log('[EmailPasswordLoginForm] Starting email/password login');

      // Use the login method from AuthContext
      await login(email, password);

      // Note: We don't need to handle redirection here as it's handled by the AuthContext
    } catch (error: unknown) {
      console.error('[EmailPasswordLoginForm] Auth error:', error);
      // Error handling is done in the AuthContext
    } finally {
      // Reset external loading state if needed
      // The AuthContext will handle its own loading state
      if (!authIsLoading) {
        setExternalIsLoading(false);
      }
    }
  };

  return (
    // <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
    <>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          disabled={isLoading}
          data-testid="login-email-input"
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          disabled={isLoading}
          data-testid="login-password-input"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full"
        onClick={handleEmailPasswordLogin}
        data-testid="email-login-button"
      >
        {isLoading ? 'Signing in...' : 'Sign in with Email'}
      </Button>
      {/* </form> */}
    </>
  );
}
