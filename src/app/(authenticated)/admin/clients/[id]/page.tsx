import AdminGuard from "@/components/auth/AdminGuard";
import ClientForm from "@/components/admin/ClientForm";
import { notFound } from "next/navigation";
import { createClientServer } from "@/utils/supabase/server";

export default async function EditClientPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClientServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", session?.user.id)
    .single();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!client) {
    notFound();
  }

  return (
    <AdminGuard user={user}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">Edit Client</h1>
          <p className="mt-2 text-sm text-slate-600">
            Update client information.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          <ClientForm mode="edit" initialData={client} />
        </div>
      </div>
    </AdminGuard>
  );
}
