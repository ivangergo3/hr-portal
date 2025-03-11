'use client';

import { LuRefreshCw, LuTriangleAlert } from 'react-icons/lu';
import ErrorBoundary from './ErrorBoundary';
import { Button } from '../ui/button';

export default function DataErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <LuTriangleAlert className="h-8 w-8 text-red-500" />
            <h2 className="text-xl font-semibold text-slate-900">
              Data Loading Error
            </h2>
          </div>
          <p className="mt-3 text-base text-slate-500">
            We couldn&apos;t load the data for this page. This could be due to a
            temporary issue.
          </p>
          <div className="mt-6">
            <Button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              <LuRefreshCw className="h-4 w-4" />
              Refresh page
            </Button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
