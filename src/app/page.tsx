import LoginButton from "@/components/auth/LoginButton";
import { redirect } from "next/navigation";
import { createClientServer } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClientServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If user is logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Welcome to HR Portal</h1>
          <p className="mt-2 text-gray-600">Please sign in to continue</p>
        </div>
        <div className="flex justify-center">
          <LoginButton />
        </div>
      </div>
    </div>
  );
}
