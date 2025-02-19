import { redirect } from "next/navigation";
import UsersList from "@/components/admin/UsersList";
import DataErrorBoundary from "@/components/common/DataErrorBoundary";
import { createClientServer } from "@/utils/supabase/server";

export default async function UsersPage() {
  try {
    const supabase = await createClientServer();

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      redirect("/error?code=auth");
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (userError) {
      redirect("/error?code=critical");
    }

    if (userData?.role !== "admin") {
      redirect("/error?code=permission");
    }

    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (usersError) {
      redirect("/error?code=critical");
    }

    return (
      <DataErrorBoundary>
        <UsersList initialUsers={users || []} currentUserId={session.user.id} />
      </DataErrorBoundary>
    );
  } catch (error) {
    console.error("[Users] Critical error:", error);
    redirect("/error?code=critical");
  }
}
