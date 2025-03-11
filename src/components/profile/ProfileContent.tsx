'use client';

import React from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';

interface ProfileContentProps {
  formData: {
    full_name: string;
    email: string;
  };
  onChange: (field: string, value: string) => void;
  error: string | null;
}

export function ProfileContent({
  formData,
  onChange,
  error,
}: ProfileContentProps) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <Label
              htmlFor="full_name"
              className="block text-sm font-medium text-slate-900"
            >
              Full Name
            </Label>
            <Input
              data-testid="full-name-input"
              type="text"
              id="full_name"
              value={formData.full_name}
              onChange={(e) => onChange('full_name', e.target.value)}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 text-sm text-slate-900"
            />
          </div>
          <div>
            <Label
              htmlFor="email"
              className="block text-sm font-medium text-slate-900"
            >
              Email
            </Label>
            <Input
              data-testid="email-input"
              type="email"
              id="email"
              value={formData.email}
              disabled
              className="mt-1 block w-full rounded-md border-slate-300 bg-slate-50 shadow-sm text-sm text-slate-900"
            />
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
