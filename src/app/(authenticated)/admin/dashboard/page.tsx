import { Suspense } from "react";
import { createClientServer } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/admin/DashboardHeader";
import { DashboardContent } from "@/components/admin/DashboardContent";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";

async function getInitialData() {
  const supabase = await createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [
    { count: totalUsers },
    { count: totalProjects },
    { count: pendingTimesheets },
    { count: pendingTimeoffs },
    { data: timeEntries },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase
      .from("timesheet_weeks")
      .select("*", { count: "exact", head: true })
      .eq("status", "submitted"),
    supabase
      .from("time_off_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "submitted"),
    supabase.from("timesheet_weeks").select("total_hours"),
  ]);

  const totalHours =
    timeEntries?.reduce((sum, entry) => sum + (entry.total_hours || 0), 0) || 0;

  return {
    stats: {
      totalUsers: totalUsers || 0,
      totalProjects: totalProjects || 0,
      pendingTimesheets: pendingTimesheets || 0,
      pendingTimeoffs: pendingTimeoffs || 0,
      totalHours,
    },
  };
}

export default async function AdminDashboardPage() {
  const { stats } = await getInitialData();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Server-rendered header with stats */}
      <DashboardHeader stats={stats} />

      {/* Client-rendered content with loading state */}
      <Suspense
        fallback={
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="relative min-h-[200px]">
              <LoadingOverlay />
            </div>
          </div>
        }
      >
        <DashboardContent />
      </Suspense>
    </div>
  );
}
