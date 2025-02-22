import { redirect } from 'next/navigation';
import React from 'react';
import { SupabaseError } from '@/types/database.types';
import DashboardPage from '@/components/dashboard/DashboardPage';
import DataErrorBoundary from '@/components/common/DataErrorBoundary';
import { createClientServer } from '@/utils/supabase/server';
export default async function Dashboard() {
  try {
    const supabase = await createClientServer();

    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError) {
      redirect('/error?code=auth');
    }

    if (!session) {
      redirect('/error?code=auth');
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (userError) {
      redirect('/error?code=critical');
    }

    return (
      <DataErrorBoundary>
        <DashboardPage user={user} />
      </DataErrorBoundary>
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('[Dashboard] Error:', error.message);
    } else if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'message' in error
    ) {
      const dbError = error as SupabaseError;
      console.error('[Dashboard] Database error:', {
        code: dbError.code,
        message: dbError.message,
        details: dbError.details,
      });
    } else {
      console.error('[Dashboard] Unknown error:', error);
    }
    redirect('/error?code=critical');
  }
}
