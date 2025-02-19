import { redirect, notFound } from "next/navigation";
import TimeOffRequestForm from "@/components/time-off/TimeOffRequestForm";
import { SupabaseError } from "@/types/database.types";
import { createClientServer } from "@/utils/supabase/server";

export default async function TimeOffRequestPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    const supabase = await createClientServer();

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      redirect("/error?code=auth");
    }

    // Get user data for permission check
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single();

    const { data: request, error: requestError } = await supabase
      .from("time_off_requests")
      .select("*")
      .eq("id", params.id)
      .single();

    if (requestError) {
      redirect("/error?code=critical");
    }

    if (!request) {
      notFound();
    }

    // Check if user has access to this request
    if (request.user_id !== session.user.id && userData?.role !== "admin") {
      redirect("/error?code=permission");
    }

    return (
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Edit Time Off Request
          </h1>
          <div className="mt-8">
            <TimeOffRequestForm
              userId={session.user.id}
              initialRequest={request}
              onSuccess={() => redirect("/time-off")}
              onCancel={() => redirect("/time-off")}
            />
          </div>
        </div>
      </div>
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("[TimeOff] Error:", error.message);
    } else if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      "message" in error
    ) {
      const dbError = error as SupabaseError;
      console.error("[TimeOff] Database error:", {
        code: dbError.code,
        message: dbError.message,
        details: dbError.details,
      });
    } else {
      console.error("[TimeOff] Unknown error:", error);
    }
    redirect("/error?code=critical");
  }
}
