import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { TimeOffHeader } from '@/components/time-off/TimeOffHeader';
import { TimeOffContent } from '@/components/time-off/TimeOffContent';
import { LoadingOverlay } from '@/components/common/LoadingOverlay';
import { createClientServer } from '@/utils/supabase/server';

export default async function TimeOffPage() {
  const supabase = await createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/');

  return (
    <div>
      <TimeOffHeader />
      <Suspense
        fallback={
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="relative min-h-[200px]">
              <LoadingOverlay />
            </div>
          </div>
        }
      >
        <TimeOffContent userId={user.id} />
      </Suspense>
    </div>
  );
}
