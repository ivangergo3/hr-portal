'use client';

import { ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { LuLoader } from 'react-icons/lu';

interface ConfirmDialogProps {
  trigger: ReactNode;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  icon?: ReactNode;
  isLoading?: boolean;
}

export function NewConfirmDialog({
  trigger,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  icon,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle
            data-testid="confirm-dialog-title"
            className="flex items-center gap-2"
          >
            {icon && <span>{icon}</span>}
            <span>{title}</span>
          </AlertDialogTitle>
          <AlertDialogDescription data-testid="confirm-dialog-message">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="confirm-dialog-cancel-button">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            data-testid="confirm-dialog-confirm-button"
          >
            {isLoading ? (
              <LuLoader className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
