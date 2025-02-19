import { redirect } from "next/navigation";
import { ProfileLayout } from "@/components/profile/ProfileLayout";
import { createClientServer } from "@/utils/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClientServer();

  try {
    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) redirect("/");

    // Fetch user profile data
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    return <ProfileLayout user={profile} />;
  } catch (error) {
    console.error("[Profile] Error:", error);
    redirect("/error?code=profile_load_failed");
  }
}
