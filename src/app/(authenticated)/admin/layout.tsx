'use client';

import AdminGuard from '@/components/auth/AdminGuard';
import ErrorBoundary from '@/components/common/ErrorBoundary';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <ErrorBoundary>{children}</ErrorBoundary>
    </AdminGuard>
  );
}
