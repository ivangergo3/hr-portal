"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
export default function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

      router.refresh();
    } catch (error) {
      console.error("[SignOut] Error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to sign out. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleSignOut}
        disabled={isLoading}
        className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 disabled:opacity-50"
      >
        {isLoading ? "Signing out..." : "Sign out"}
      </button>
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
    </>
  );
}
