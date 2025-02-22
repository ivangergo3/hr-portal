import { LuPlus } from 'react-icons/lu';

export function TimeOffHeader() {
  return (
    <div className="bg-white shadow">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Time Off</h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage your time off requests
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              data-modal-target="new-request"
              className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              <LuPlus className="h-4 w-4" />
              New Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
