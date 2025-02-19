'use client';

import React, { useState } from 'react';
import type { User } from '@/types/database.types';
import { LuSave, LuLoader } from 'react-icons/lu';
import Notification from '@/components/common/Notification';
import { SupabaseError } from '@/types/database.types';
import { createClient } from '@/utils/supabase/client';

interface ProfileFormProps {
  user: User;
  initialProfile: User;
  onSuccess: () => void;
}

export function ProfileForm({
  user,
  initialProfile,
  onSuccess,
}: ProfileFormProps) {
  const [formData, setFormData] = useState({
    full_name: initialProfile.full_name || '',
    email: initialProfile.email || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      setError(null);

      const { error: updateError } = await (
        await supabase
      )
        .from('users')
        .update({
          full_name: formData.full_name,
          // Add other fields as needed
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('[ProfileForm] Update error:', updateError.message);
        setError('Failed to update profile. Please try again.');
        return;
      }

      setNotification({
        message: 'Profile updated successfully',
        type: 'success',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('[ProfileForm] Error:', error.message);
      } else if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        'message' in error
      ) {
        const dbError = error as SupabaseError;
        console.error('[ProfileForm] Database error:', {
          code: dbError.code,
          message: dbError.message,
          details: dbError.details,
        });
      } else {
        console.error('[ProfileForm] Unknown error:', error);
      }
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="full_name"
                className="block text-sm font-medium text-slate-900"
              >
                Full Name
              </label>
              <input
                type="text"
                id="full_name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    full_name: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 text-sm text-slate-900"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-900"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                disabled
                className="mt-1 block w-full rounded-md border-slate-300 bg-slate-50 shadow-sm text-sm text-slate-900"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <LuLoader className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <LuSave className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
