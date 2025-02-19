import { redirect } from 'next/navigation';
import { TimesheetLayout } from '@/components/timesheets/TimesheetLayout';
import { startOfWeek, parseISO } from 'date-fns';
import type { PageProps } from '@/types/next.types';
import { createClientServer } from '@/utils/supabase/server';

export default async function TimesheetsPage({ searchParams }: PageProps) {
  const supabase = await createClientServer();

  try {
    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) redirect('/');

    // Get selected week
    const selectedWeek = searchParams.week
      ? parseISO(searchParams.week)
      : startOfWeek(new Date(), { weekStartsOn: 1 });

    // Fetch data
    const [
      { data: dbUser },
      { data: projects },
      { data: timesheets },
      { data: timesheetWeeks },
    ] = await Promise.all([
      supabase.from('users').select('*').eq('id', user.id).single(),
      supabase.from('projects').select('*, clients(*)').throwOnError(),
      supabase
        .from('timesheets')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start_date', selectedWeek.toISOString())
        .throwOnError(),
      supabase
        .from('timesheet_weeks')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start_date', selectedWeek.toISOString())
        .throwOnError(),
    ]);

    return (
      <TimesheetLayout
        user={dbUser}
        projects={projects || []}
        weekStart={selectedWeek}
        weekStatus={timesheetWeeks?.[0]?.status || 'draft'}
        timesheets={timesheets || []}
      />
    );
  } catch (error) {
    console.error('[Timesheets] Error:', error);
    redirect('/error?code=timesheet_load_failed');
  }
}
