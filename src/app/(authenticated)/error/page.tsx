"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LuShieldAlert } from "react-icons/lu";

const errorMessages = {
  critical: {
    title: "Critical Error",
    message:
      "A critical error occurred that prevents the application from functioning properly.",
  },
  auth: {
    title: "Authentication Error",
    message:
      "There was a problem with your authentication. Please try signing in again.",
  },
  permission: {
    title: "Permission Denied",
    message: "You don't have permission to access this resource.",
  },
  default: {
    title: "Unexpected Error",
    message: "An unexpected error occurred. Please try again later.",
  },
};

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code") as keyof typeof errorMessages;
  const error = errorMessages[code] || errorMessages.default;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
      <div className="mx-auto max-w-max">
        <main className="sm:flex">
          <div className="sm:ml-6">
            <div className="sm:border-l sm:border-slate-200 sm:pl-6">
              <div className="flex items-center gap-4">
                <LuShieldAlert className="h-8 w-8 text-red-500" />
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {error.title}
                </h1>
              </div>
              <p className="mt-3 text-base text-slate-500">{error.message}</p>
              <div className="mt-8">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                >
                  Return to dashboard
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
