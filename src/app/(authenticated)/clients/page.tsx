import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ClientsContent } from "@/components/clients/ClientsContent";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import { createClientServer } from "@/utils/supabase/server";

// Server component for data fetching
async function ClientsData({ showArchived }: { showArchived: boolean }) {
  const supabase = await createClientServer();

  // Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) redirect("/");

  // Check admin status
  const { data: currentUser } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (currentUser?.role !== "admin") {
    redirect("/");
  }

  // Fetch clients based on archive status
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("archived", showArchived)
    .order("name");

  return <ClientsContent clients={clients || []} showArchived={showArchived} />;
}

export default function ClientsPage({
  searchParams,
}: {
  searchParams: { archived?: string };
}) {
  const showArchived = searchParams.archived === "true";

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50">
          <div className="relative">
            <LoadingOverlay />
          </div>
        </div>
      }
    >
      <ClientsData showArchived={showArchived} />
    </Suspense>
  );
}
