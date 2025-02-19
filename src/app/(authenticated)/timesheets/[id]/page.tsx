import { redirect, notFound } from "next/navigation";
import { TimesheetForm } from "@/components/timesheets/TimesheetForm";
import { createClientServer } from "@/utils/supabase/server";

export default async function TimesheetPage({
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

    const { data: timesheet, error: timesheetError } = await supabase
      .from("timesheet_weeks")
      .select("*, user:users(*)")
      .eq("id", params.id)
      .single();

    if (timesheetError) {
      redirect("/error?code=critical");
    }

    if (!timesheet) {
      notFound();
    }

    // Check if user has access to this timesheet
    if (timesheet.user_id !== session.user.id && userData?.role !== "admin") {
      redirect("/error?code=permission");
    }

    // Get projects for the form
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (projectsError) {
      redirect("/error?code=critical");
    }

    // After getting session
    const { data: dbUser } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .single();

    return (
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Edit Timesheet
          </h1>
          <div className="mt-8">
            <TimesheetForm
              user={dbUser}
              weekStart={new Date(timesheet.week_start_date)}
              projects={projects || []}
              initialTimesheets={[timesheet]}
              weekStatus={timesheet.status || "draft"}
              onCancel={() => redirect("/timesheets")}
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("[Timesheet] Critical error:", error);
    redirect("/error?code=critical");
  }
}
