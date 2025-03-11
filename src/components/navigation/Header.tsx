'use client';

import SignOutButton from '@/components/auth/SignOutButton';
import Link from 'next/link';
import { LuUser } from 'react-icons/lu';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { user, dbUser } = useAuth();

  if (!user || !dbUser) {
    return null;
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-slate-50 px-6">
      <div />
      <div className="flex items-center gap-4">
        <span
          className="text-sm text-slate-900"
          data-testid="header-profile-name"
        >
          {dbUser.full_name || user.email}
        </span>
        <Link
          data-testid="header-profile-link"
          href="/profile"
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <LuUser className="w-5 h-5 text-slate-600" />
        </Link>
        <SignOutButton />
      </div>
    </header>
  );
}
