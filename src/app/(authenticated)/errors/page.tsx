'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  LuCircleAlert,
  LuLock,
  LuShieldAlert,
  LuDatabase,
  LuClock,
  LuTriangleAlert,
  LuRefreshCw,
  LuLayoutDashboard,
} from 'react-icons/lu';

// Define error messages for different error types
const errorMessages = {
  critical: {
    title: 'Critical Error',
    message:
      'A critical system error has occurred. Our team has been notified and is working to resolve the issue.',
  },
  auth: {
    title: 'Authentication Error',
    message:
      'Your session has expired or you are not authenticated. Please log in again to continue.',
  },
  permission: {
    title: 'Permission Denied',
    message:
      'You do not have permission to access this resource. Please contact your administrator if you believe this is an error.',
  },
  data: {
    title: 'Data Error',
    message:
      'We encountered an issue while retrieving or processing data. Please try again later.',
  },
  timeout: {
    title: 'Request Timeout',
    message:
      'The request took too long to complete. Please check your connection and try again.',
  },
  validation: {
    title: 'Validation Error',
    message:
      'The submitted data contains errors. Please check your input and try again.',
  },
  default: {
    title: 'Unexpected Error',
    message:
      'An unexpected error has occurred. Please try again or contact support if the issue persists.',
  },
};

export default function AuthenticatedErrorPage() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('code') || 'default';

  // Get the appropriate error message based on the error code
  const errorInfo =
    errorMessages[errorCode as keyof typeof errorMessages] ||
    errorMessages.default;

  // Get the appropriate icon based on the error code
  const getErrorIcon = () => {
    switch (errorCode) {
      case 'auth':
        return <LuLock className="w-12 h-12 text-red-500" />;
      case 'permission':
        return <LuShieldAlert className="w-12 h-12 text-red-500" />;
      case 'data':
        return <LuDatabase className="w-12 h-12 text-red-500" />;
      case 'timeout':
        return <LuClock className="w-12 h-12 text-red-500" />;
      case 'validation':
        return <LuTriangleAlert className="w-12 h-12 text-red-500" />;
      default:
        return <LuCircleAlert className="w-12 h-12 text-red-500" />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center text-center">
          {getErrorIcon()}
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            {errorInfo.title}
          </h2>
          <p className="mt-2 text-gray-600">{errorInfo.message}</p>
        </div>

        <div className="mt-8 space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <LuRefreshCw className="mr-2" /> Try Again
          </button>

          <Link
            href="/dashboard"
            className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <LuLayoutDashboard className="mr-2" /> Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
