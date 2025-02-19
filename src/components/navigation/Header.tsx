import SignOutButton from "@/components/auth/SignOutButton";
import Link from "next/link";
import { LuUser } from "react-icons/lu";
import { createClientServer } from "@/utils/supabase/server";

export default async function Header() {
  try {
    const supabase = await createClientServer();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("[Header] Auth error:", authError.message);
      return null; // Let the layout handle the redirect
    }

    if (!user) {
      return null;
    }

    try {
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("full_name, email, role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("[Header] Profile fetch error:", profileError.message);
        throw profileError;
      }

      return (
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-slate-50 px-6">
          <div />
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-900">
              {profile?.full_name || user.email}
            </span>
            <Link
              href="/profile"
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <LuUser className="w-5 h-5 text-slate-600" />
            </Link>
            <SignOutButton />
          </div>
        </header>
      );
    } catch (error) {
      console.error("[Header] Data fetch error:", error);
      return (
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-slate-50 px-6">
          <div />
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">
              Error loading profile
            </span>
            <SignOutButton />
          </div>
        </header>
      );
    }
  } catch (error) {
    console.error("[Header] Critical error:", error);
    return null;
  }
}
