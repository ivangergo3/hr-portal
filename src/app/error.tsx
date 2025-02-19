"use client";

import { useEffect } from "react";
import Link from "next/link";
import { LuTriangleAlert } from "react-icons/lu";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("[Global Error]", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-slate-50 px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
          <div className="mx-auto max-w-max">
            <main className="sm:flex">
              <p className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                500
              </p>
              <div className="sm:ml-6">
                <div className="sm:border-l sm:border-slate-200 sm:pl-6">
                  <div className="flex items-center gap-4">
                    <LuTriangleAlert className="h-8 w-8 text-red-500" />
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                      Something went wrong
                    </h1>
                  </div>
                  <p className="mt-3 text-base text-slate-500">
                    An unexpected error occurred. Our team has been notified.
                  </p>
                  <div className="mt-8 flex gap-4">
                    <button
                      onClick={reset}
                      className="inline-flex items-center rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                    >
                      Try again
                    </button>
                    <Link
                      href="/"
                      className="inline-flex items-center rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-200"
                    >
                      Go to home
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
