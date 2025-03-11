'use client';

import { useState, useEffect } from 'react';
import { LuLoader, LuPlus } from 'react-icons/lu';
import type { Client } from '@/types/database.types';
import { createClient } from '@/utils/supabase/client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner';
import { validateProjectName } from '@/utils/validation';

export function AddProjectModal({ refresh }: { refresh: () => void }) {
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('archived', false)
          .order('name');

        if (error) throw error;
        setClients(data || []);
      } catch (error) {
        console.error('[AddProject] Clients fetch error:', error);
        setError('Failed to load clients');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchClients();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() && !clientId) {
      setError('Project name and client are required');
      return;
    }
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }
    if (!clientId) {
      setError('Client is required');
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      const error = validateProjectName(name);
      if (error) {
        setError(error);
        return;
      }

      const { error: insertError } = await supabase
        .from('projects')
        .insert([{ name: name.trim(), client_id: clientId }]);
      if (insertError) throw insertError;
      refresh();
      setIsOpen(false);
      toast.success('Project added successfully');
    } catch (error) {
      console.error('[AddProject] Submit error:', error);
      if (error?.message.includes('duplicate key')) {
        setError('Project already exists.');
      } else {
        setError('Failed to add project. Please try again.');
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
          data-testid="add-project-modal-trigger"
        >
          <LuPlus className="h-4 w-4" /> Add New Project
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle data-testid="add-project-modal-title">
            Add New Project
          </DialogTitle>
          <DialogDescription>
            Add a new project to your company.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Project Name
            </Label>
            <Input
              data-testid="add-project-name-input"
              id="name"
              placeholder="Enter project name"
              className="col-span-3"
              onChange={(e) => setName(e.currentTarget.value)}
            />
            <Label htmlFor="name" className="text-right">
              Client
            </Label>
            <Select
              disabled={isLoading}
              onValueChange={(value) => setClientId(value)}
            >
              <SelectTrigger
                className="col-span-3"
                data-testid="add-project-client-select"
              >
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem
                    key={client.id}
                    value={client.id}
                    data-testid={`add-project-client-select-item-${client.id}`}
                  >
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && (
            <Alert variant="destructive" data-testid="add-project-error">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button
            type="submit"
            variant="secondary"
            data-testid="add-project-cancel-button"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            data-testid="add-project-submit-button"
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? (
              <LuLoader
                className="animate-spin"
                data-testid="add-project-submit-button-loading"
              />
            ) : (
              'Add Project'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
