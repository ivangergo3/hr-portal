import { redirect } from "next/navigation";
import { ClientsWrapper } from "@/components/clients/ClientsWrapper";
import { createClientServer } from "@/utils/supabase/server";

export default async function ClientsPage() {
  const supabase = await createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  // Check if user is admin
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "admin") {
    redirect("/dashboard");
  }

  return <ClientsWrapper />;
}
