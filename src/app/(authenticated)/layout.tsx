import Header from '@/components/navigation/Header';
import Sidebar from '@/components/navigation/Sidebar';
import { redirect } from 'next/navigation';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { createClientServer } from '@/utils/supabase/server';

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const supabase = await createClientServer();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error('[Auth Layout] Auth error:', authError.message);
      redirect('/');
    }

    if (!user) {
      redirect('/');
    }

    try {
      const { data: dbUser, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      let currentUser = dbUser;

      if (dbError) {
        console.error('[Auth Layout] DB user fetch error:', dbError.message);
        throw dbError;
      }

      if (!dbUser) {
        // Create new user if doesn't exist
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([
            {
              id: user.id,
              email: user.email,
              role: 'employee',
              full_name: user.user_metadata?.full_name || '',
            },
          ])
          .select()
          .single();

        if (createError) {
          console.error(
            '[Auth Layout] User creation error:',
            createError.message,
          );
          throw createError;
        }

        if (!newUser) {
          throw new Error('Failed to create user record');
        }

        currentUser = newUser;
      }

      return (
        <ErrorBoundary>
          <div className="flex h-screen bg-slate-50">
            <Sidebar user={currentUser} />
            <div className="flex flex-1 flex-col">
              <Header />
              <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
                {children}
              </main>
            </div>
          </div>
        </ErrorBoundary>
      );
    } catch (error) {
      console.error('[Auth Layout] Database error:', error);
      return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-slate-900">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Please try refreshing the page or contact support if the problem
              persists.
            </p>
          </div>
        </div>
      );
    }
  } catch (error) {
    console.error('[Auth Layout] Critical error:', error);
    redirect('/error?code=critical');
  }
}
