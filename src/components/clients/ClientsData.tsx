import { redirect } from "next/navigation";
import { ClientsContent } from "@/components/clients/ClientsContent";
import { createClientServer } from "@/utils/supabase/server";
export async function ClientsData({
  showArchived,
  userId,
}: {
  showArchived: boolean;
  userId: string;
}) {
  const supabase = createClientServer();

  // Check admin status
  const { data: currentUser } = await (await supabase)
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  if (currentUser?.role !== "admin") {
    redirect("/");
  }

  // Fetch clients based on archive status
  const { data: clients } = await (await supabase)
    .from("clients")
    .select("*")
    .eq("archived", showArchived)
    .order("name");

  return <ClientsContent clients={clients || []} showArchived={showArchived} />;
}
