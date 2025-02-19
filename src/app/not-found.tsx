import Link from "next/link";
import { LuFileQuestion } from "react-icons/lu";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
      <div className="mx-auto max-w-max">
        <main className="sm:flex">
          <p className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            404
          </p>
          <div className="sm:ml-6">
            <div className="sm:border-l sm:border-slate-200 sm:pl-6">
              <div className="flex items-center gap-4">
                <LuFileQuestion className="h-8 w-8 text-slate-400" />
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Page not found
                </h1>
              </div>
              <p className="mt-3 text-base text-slate-500">
                Sorry, we couldn't find the page you're looking for.
              </p>
              <div className="mt-8">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                >
                  Go back to dashboard
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
