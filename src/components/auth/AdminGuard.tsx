'use client';

import { useRouter } from 'next/navigation';
import { User } from '@/types/database.types';

export default function AdminGuard({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) {
  const router = useRouter();

  if (user.role !== 'admin') {
    router.push('/dashboard');
    return null;
  }

  return <>{children}</>;
}
