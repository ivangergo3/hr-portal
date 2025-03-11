'use client';

import Header from '@/components/navigation/Header';
import Sidebar from '@/components/navigation/Sidebar';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import DataErrorBoundary from '@/components/common/DataErrorBoundary';
import AuthGuard from '@/components/auth/AuthGuard';
import { PageTransitionLoader } from '@/components/common/PageTransitionLoader';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isPageLoading } = useAuth();

  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen bg-slate-50 p-4">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              An unexpected error occurred. Please try refreshing the page.
            </p>
          </div>
        </div>
      }
    >
      <AuthGuard>
        {isPageLoading ? (
          <PageTransitionLoader />
        ) : (
          <div className="flex h-screen overflow-hidden bg-slate-50">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto p-4 md:p-6">
                <DataErrorBoundary>{children}</DataErrorBoundary>
              </main>
            </div>
          </div>
        )}
      </AuthGuard>
    </ErrorBoundary>
  );
}
