'use client';

import { LuPlus, LuLoader } from 'react-icons/lu';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

import { DialogDescription, DialogFooter, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { DialogTitle } from '../ui/dialog';
import { DialogHeader } from '../ui/dialog';
import { DialogContent } from '../ui/dialog';
import { Dialog } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner';
import { validateClientName } from '@/utils/validation';

export function AddClientModal({ refresh }: { refresh: () => void }) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Client name is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const error = validateClientName(name);
      if (error) {
        setError(error);
        return;
      }

      const { error: insertError } = await supabase
        .from('clients')
        .insert([{ name: name.trim() }]);

      if (insertError) throw insertError;
      refresh();
      setIsOpen(false);
      toast.success('Client added successfully');
    } catch (error) {
      console.error('[AddClient] Submit error:', error);
      if (error?.message.includes('duplicate key')) {
        setError('Client already exists.');
      } else {
        setError('Failed to add client. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setIsOpen(true)}
          data-testid="add-client-modal-trigger"
        >
          <LuPlus className="h-4 w-4" /> Add New Client
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle data-testid="add-client-modal-title">
            Add New Client
          </DialogTitle>
          <DialogDescription>
            Add a new client to your company.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Client Name
            </Label>
            <Input
              data-testid="add-client-name-input"
              id="name"
              placeholder="Enter client name"
              className="col-span-3"
              onChange={(e) => setName(e.currentTarget.value)}
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription data-testid="add-client-error">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button
            type="submit"
            variant="secondary"
            data-testid="add-client-cancel-button"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            data-testid="add-client-submit-button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <LuLoader
                className="animate-spin"
                data-testid="add-client-submit-button-loading"
              />
            ) : (
              'Add Client'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
