import { redirect } from "next/navigation";
import { UsersLayout } from "@/components/users/UsersLayout";
import { createClientServer } from "@/utils/supabase/server";

export default async function UsersPage() {
  const supabase = await createClientServer();

  try {
    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) redirect("/");

    // Fetch user data and check admin status
    const { data: currentUser } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (currentUser?.role !== "admin") {
      redirect("/");
    }

    // Fetch all users
    const { data: users } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    return <UsersLayout users={users || []} />;
  } catch (error) {
    console.error("[Users] Error:", error);
    redirect("/error?code=users_load_failed");
  }
}
