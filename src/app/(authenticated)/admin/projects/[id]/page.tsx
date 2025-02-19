import AdminGuard from '@/components/auth/AdminGuard';
import ProjectForm from '@/components/admin/ProjectForm';
import { notFound } from 'next/navigation';
import { Project, Client } from '@/types/database.types';
import DataErrorBoundary from '@/components/common/DataErrorBoundary';
import { createClientServer } from '@/utils/supabase/server';

export default async function EditProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClientServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: dbUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .single();

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('archived', false)
    .order('name');

  if (!project) {
    notFound();
  }

  return (
    <AdminGuard user={dbUser}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">
            Edit Project
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Update project information.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          <DataErrorBoundary>
            <ProjectForm
              mode="edit"
              initialData={project as Project}
              clients={clients as Client[]}
            />
          </DataErrorBoundary>
        </div>
      </div>
    </AdminGuard>
  );
}
