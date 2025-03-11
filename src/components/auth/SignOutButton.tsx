'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { logout, isLoading: authIsLoading } = useAuth();

  // Combine local loading state with auth context loading state
  const combinedIsLoading = isLoading || authIsLoading;

  const handleSignOut = async () => {
    try {
      setIsLoading(true);

      // Use the logout method from AuthContext
      await logout();

      // Note: We don't need to handle redirection here as it's handled by the AuthContext
    } catch (error) {
      console.error('[SignOut] Error:', error);
      toast.error('Failed to sign out. Please try again.');
    } finally {
      // Reset local loading state
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="secondary"
        onClick={handleSignOut}
        disabled={combinedIsLoading}
        data-testid="logout-button"
      >
        {combinedIsLoading ? 'Signing out...' : 'Sign out'}
      </Button>
    </>
  );
}
