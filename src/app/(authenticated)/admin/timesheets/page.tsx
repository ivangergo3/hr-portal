import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import TimesheetApprovalWrapper from '@/components/timesheets/TimesheetApprovalWrapper';
import { createClientServer } from '@/utils/supabase/server';

export default async function TimesheetApprovalsPage() {
  const supabase = await createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/');

  return (
    <div>
      <Suspense
        fallback={
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="relative min-h-[200px]">
              <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-slate-600 animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-4 h-4 rounded-full bg-slate-600 animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-4 h-4 rounded-full bg-slate-600 animate-bounce" />
                </div>
              </div>
            </div>
          </div>
        }
      >
        <TimesheetApprovalWrapper userId={user.id} />
      </Suspense>
    </div>
  );
}
