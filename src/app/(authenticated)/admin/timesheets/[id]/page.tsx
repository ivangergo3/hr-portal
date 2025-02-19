import { redirect } from "next/navigation";
import TimesheetReview from "@/components/admin/TimesheetReview";
import { format } from "date-fns";
import Link from "next/link";
import { createClientServer } from "@/utils/supabase/server";

export default async function TimesheetPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClientServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Check if user is admin
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "admin") {
    redirect("/dashboard");
  }

  // Get the timesheet week with all related data
  const { data: weekData } = await supabase
    .from("timesheet_weeks")
    .select(
      `
      *,
      user:users!timesheet_weeks_user_id_fkey(
        id,
        full_name,
        email
      ),
      timesheets(
        *,
        project:projects!timesheets_project_id_fkey(
          id,
          name,
          client:clients!projects_client_id_fkey(
            id,
            name
          )
        )
      )
    `
    )
    .eq("id", params.id)
    .single();

  if (!weekData) {
    redirect("/admin/timesheets");
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-slate-900">
              Review Timesheet
            </h1>
            <span
              className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                weekData.status === "submitted"
                  ? "bg-yellow-50 text-yellow-700"
                  : weekData.status === "approved"
                  ? "bg-green-50 text-green-700"
                  : weekData.status === "rejected"
                  ? "bg-red-50 text-red-700"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {weekData.status}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-700">
            {weekData.user.full_name}&apos;s timesheet for week of{" "}
            {format(new Date(weekData.week_start_date), "MMMM d, yyyy")}
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0">
          <Link
            href="/admin/timesheets"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            ← Back to Timesheets
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <TimesheetReview timesheet={weekData} isLoading={false} />
      </div>
    </div>
  );
}
