'use client';

import React from 'react';
import { LuSave, LuLoader } from 'react-icons/lu';
import { createClient } from '@/utils/supabase/client';
import { LIMITS } from '@/utils/validation';
import type { User } from '@/types/database.types';
import { SupabaseError } from '@/types/database.types';
import { Button } from '../ui/button';
import { toast } from 'sonner';

interface ProfileHeaderProps {
  isLoading: boolean;
  formData: {
    full_name: string;
    email: string;
  };
  user: User;
  onSuccess: () => void;
  setError: (error: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export function ProfileHeader({
  isLoading,
  formData,
  user,
  onSuccess,
  setError,
  setIsLoading,
}: ProfileHeaderProps) {
  const supabase = createClient();

  const handleSave = async () => {
    if (!formData.full_name.trim()) {
      setError('Full name is required');
      return;
    }

    if (formData.full_name.length > LIMITS.MAX_NAME_LENGTH) {
      setError('Name is too long');
      return;
    }

    if (formData.full_name.trim() === user.full_name) {
      toast.success('No changes made');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { error: updateError } = await (
        await supabase
      )
        .from('users')
        .update({
          full_name: formData.full_name,
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('[ProfileHeader] Update error:', updateError.message);
        setError('Failed to update profile. Please try again.');
        return;
      }
      toast.success('Profile updated successfully');

      onSuccess();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('[ProfileHeader] Error:', error.message);
      } else if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        'message' in error
      ) {
        const dbError = error as SupabaseError;
        console.error('[ProfileHeader] Database error:', {
          code: dbError.code,
          message: dbError.message,
          details: dbError.details,
        });
      } else {
        console.error('[ProfileHeader] Unknown error:', error);
      }
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
          <Button
            data-testid="profile-save-button"
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <LuLoader className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <LuSave className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
