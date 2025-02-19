'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Client } from '@/types/database.types';
import { createClientServer } from '@/utils/supabase/server';
type Props = {
  initialData?: Client;
  mode: 'create' | 'edit';
};

export default function ClientForm({ initialData, mode }: Props) {
  const [name, setName] = useState(initialData?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClientServer();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      if (mode === 'create') {
        const { error: createError } = await (await supabase)
          .from('clients')
          .insert([{ name }]);

        if (createError) {
          if (createError.code === '23505') {
            setError('A client with this name already exists.');
            return;
          }
          setError('Failed to create client. Please try again.');
          return;
        }
      } else {
        const { error: updateError } = await (
          await supabase
        )
          .from('clients')
          .update({
            name,
            updated_at: new Date().toISOString(),
          })
          .eq('id', initialData?.id);

        if (updateError) {
          if (updateError.code === '23505') {
            setError('A client with this name already exists.');
            return;
          }
          setError('Failed to update client. Please try again.');
          return;
        }
      }

      router.refresh();
      router.push('/admin/clients');
    } catch (error) {
      console.error('Error saving client:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-slate-900"
        >
          Client Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`mt-1 block w-full rounded-md border ${
            error ? 'border-red-300' : 'border-slate-300'
          } px-3 py-2 text-slate-900 bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400`}
          placeholder="Enter client name"
          required
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {isSaving
            ? 'Saving...'
            : mode === 'create'
              ? 'Create Client'
              : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/clients')}
          className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
