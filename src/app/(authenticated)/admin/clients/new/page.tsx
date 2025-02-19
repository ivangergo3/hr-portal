import AdminGuard from '@/components/auth/AdminGuard';
import ClientForm from '@/components/admin/ClientForm';
import { createClientServer } from '@/utils/supabase/server';

export default async function NewClientPage() {
  const supabase = await createClientServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session?.user.id)
    .single();

  return (
    <AdminGuard user={user}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">New Client</h1>
          <p className="mt-2 text-sm text-slate-600">
            Add a new client to the system.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          <ClientForm mode="create" />
        </div>
      </div>
    </AdminGuard>
  );
}
