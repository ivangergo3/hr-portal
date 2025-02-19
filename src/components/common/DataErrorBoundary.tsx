"use client";

import ErrorBoundary from "./ErrorBoundary";

export default function DataErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="text-center py-12">
          <h2 className="text-lg font-semibold text-slate-900">
            Unable to load data
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Please try refreshing the page or contact support if the problem
            persists.
          </p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
