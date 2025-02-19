import { redirect } from "next/navigation";
import { ProjectsContent } from "@/components/projects/ProjectsContent";
import { createClientServer } from "@/utils/supabase/server";

export async function ProjectsData({
  showArchived,
  userId,
}: {
  showArchived: boolean;
  userId: string;
}) {
  const supabase = createClientServer();

  // Check admin status
  const { data: currentUser } = await (await supabase)
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  if (currentUser?.role !== "admin") {
    redirect("/");
  }

  // Fetch projects and clients
  const [{ data: projects }, { data: clients }] = await Promise.all([
    (await supabase)
      .from("projects")
      .select("*")
      .eq("archived", showArchived)
      .order("name"),
    (await supabase)
      .from("clients")
      .select("*")
      .eq("archived", false)
      .order("name"),
  ]);

  return (
    <ProjectsContent
      projects={projects || []}
      clients={clients || []}
      showArchived={showArchived}
    />
  );
}
