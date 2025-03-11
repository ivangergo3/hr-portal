'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LuFileQuestion, LuLayoutDashboard, LuArrowLeft } from 'react-icons/lu';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center text-center">
          <LuFileQuestion className="w-12 h-12 text-blue-500" />
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Page Not Found
          </h2>
          <p className="mt-2 text-gray-600">
            The page you are looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Button
            onClick={() => window.history.back()}
            className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <LuArrowLeft className="mr-2" /> Go Back
          </Button>

          <Link
            href="/"
            className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <LuLayoutDashboard className="mr-2" /> Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
