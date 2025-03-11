'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { LuCircleAlert, LuRefreshCw, LuLayoutDashboard } from 'react-icons/lu';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center text-center">
          <LuCircleAlert className="w-12 h-12 text-red-500" />
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Application Error
          </h2>
          <p className="mt-2 text-gray-600">
            Something went wrong. We&apos;ve been notified and are working to
            fix the issue.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Button
            onClick={() => reset()}
            className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <LuRefreshCw className="mr-2" /> Try Again
          </Button>

          <Link
            href="/"
            className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <LuLayoutDashboard className="mr-2" /> Go to Home
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium text-gray-900">
              Error Details (Development Only)
            </h3>
            <p className="mt-2 text-xs text-gray-500 break-words">
              {error.message}
            </p>
            <p className="mt-2 text-xs text-gray-500 break-words">
              {error.stack}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
