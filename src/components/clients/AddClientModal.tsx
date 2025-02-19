'use client';

import { useState } from 'react';
import { LuLoader } from 'react-icons/lu';
import Modal from '@/components/common/Modal';
import { createClient } from '@/utils/supabase/client';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddClientModal({
  isOpen,
  onClose,
  onSuccess,
}: AddClientModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Client name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const { error: insertError } = await supabase
        .from('clients')
        .insert([{ name: name.trim() }]);

      if (insertError) throw insertError;

      setName('');
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error('[AddClient] Submit error:', error);
      setError('Failed to add client. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Client">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-slate-700"
          >
            Client Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm text-slate-900"
            placeholder="Enter client name"
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {isSubmitting ? (
              <LuLoader className="h-4 w-4 animate-spin" />
            ) : (
              'Add Client'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
