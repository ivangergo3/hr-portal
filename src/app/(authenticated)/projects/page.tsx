import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { ProjectsPageHeader } from '@/components/projects/ProjectsPageHeader';
import { ProjectsContent } from '@/components/projects/ProjectsContent';
import { LoadingOverlay } from '@/components/common/LoadingOverlay';
import { createClientServer } from '@/utils/supabase/server';
// Server Component for initial data
async function getInitialData() {
  const supabase = await createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  // Get total counts for header stats
  const [{ count: activeCount }, { count: archivedCount }] = await Promise.all([
    supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('archived', false),
    supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('archived', true),
  ]);

  return { user, stats: { activeCount, archivedCount } };
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { archived?: string };
}) {
  const showArchived = searchParams.archived === 'true';
  const { stats } = await getInitialData();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Instant load: Header with stats */}
      <ProjectsPageHeader
        showArchived={showArchived}
        activeCount={stats.activeCount || 0}
        archivedCount={stats.archivedCount || 0}
      />

      {/* Dynamic load: Project list with loading state */}
      <Suspense
        fallback={
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="relative min-h-[200px]">
              <LoadingOverlay />
            </div>
          </div>
        }
      >
        <ProjectsContent showArchived={showArchived} />
      </Suspense>
    </div>
  );
}
