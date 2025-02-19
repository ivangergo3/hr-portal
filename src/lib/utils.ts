import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// TODO: use it more or remove it
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
