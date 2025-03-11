'use client';

import React, { useState } from 'react';
import { LuLoader, LuPlus } from 'react-icons/lu';
import { Role } from '@/types/database.types';
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
import { Alert, AlertDescription } from '../ui/alert';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export function InviteUserModal({ refresh }: { refresh: () => void }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const supabase = createClient();

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email && !role) {
      setError('Email and role are required');
      return;
    }

    if (!isValidEmail(email)) {
      setError('A valid email is required');
      return;
    }

    if (!(role in Role)) {
      setError('A valid role is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: inviteError } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          data: {
            role: role,
          },
        },
      });

      if (inviteError) throw inviteError;

      // Create user record
      const { error: createError } = await supabase.from('users').insert([
        {
          email: email,
          role: role,
        },
      ]);

      if (createError) throw createError;

      setIsOpen(false);
      refresh();
    } catch (error) {
      console.error('[InviteUser] Error:', error);
      setError('Failed to send invitation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setIsOpen(true)}
          data-testid="invite-user-modal-trigger"
        >
          <LuPlus className="h-4 w-4" /> Invite New User
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle data-testid="invite-user-modal-title">
            Invite New User
          </DialogTitle>
          <DialogDescription>
            Invite a new user to your company.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Email
            </Label>
            <Input
              data-testid="invite-user-email-input"
              id="email"
              placeholder="Enter user email"
              className="col-span-3"
              onChange={(e) => setEmail(e.currentTarget.value)}
            />
            <Label htmlFor="name" className="text-right">
              Role
            </Label>
            <Select onValueChange={(value) => setRole(value as Role)}>
              <SelectTrigger
                className="col-span-3"
                data-testid="invite-user-role-select-trigger"
              >
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(Role).map((role) => (
                  <SelectItem
                    key={role}
                    value={role}
                    data-testid={`invite-user-role-select-item-${role}`}
                  >
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button
            type="submit"
            variant="secondary"
            data-testid="invite-user-cancel-button"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            data-testid="invite-user-submit-button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <LuLoader
                className="animate-spin"
                data-testid="invite-user-submit-button-loading"
              />
            ) : (
              'Invite User'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
