import { startOfWeek, parseISO } from 'date-fns';
import type { PageProps } from '@/types/next.types';
import { createClientServer } from '@/utils/supabase/server';
import { TimesheetWrapper } from '@/components/timesheets/TimesheetWrapper';

// Force dynamic rendering to ensure fresh data on each request
export const dynamic = 'force-dynamic';

export default async function TimesheetsPage({ searchParams }: PageProps) {
  // Get selected week
  let selectedWeek;
  try {
    selectedWeek = searchParams.week
      ? parseISO(searchParams.week)
      : startOfWeek(new Date(), { weekStartsOn: 1 });
  } catch (error) {
    console.error('Invalid date format in week parameter:', error);
    selectedWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
  }

  // Fetch all projects
  const supabase = await createClientServer();

  // Fetch all active projects
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*, clients(*)')
    .eq('archived', false)
    .order('name');

  if (projectsError) {
    throw new Error(`Failed to fetch projects: ${projectsError.message}`);
  }

  return (
    <TimesheetWrapper weekStart={selectedWeek} projects={projects || []} />
  );
}
