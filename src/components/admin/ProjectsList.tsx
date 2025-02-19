"use client";

import AdminGuard from "@/components/auth/AdminGuard";
import { User, Project, Client } from "@/types/database.types";
import Link from "next/link";
import { LuPlus, LuArchive, LuArchiveRestore } from "react-icons/lu";
import { useState, useEffect } from "react";
import Notification from "@/components/common/Notification";
import { withRetry } from "@/utils/apiRetry";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import EmptyState from "@/components/common/EmptyState";
import { createClientServer } from "@/utils/supabase/server";
interface ProjectsListProps {
  user: User;
  initialProjects: (Project & { client: Client })[];
}

export default function ProjectsList({
  user,
  initialProjects,
}: ProjectsListProps) {
  const [showArchived, setShowArchived] = useState(false);
  const [projects, setProjects] = useState(initialProjects);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClientServer();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSkeleton rows={5} columns={4} />;
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        title="No projects found"
        message={
          showArchived
            ? "No archived projects found."
            : "No active projects found."
        }
      />
    );
  }

  const toggleArchive = async (project: Project) => {
    try {
      setError(null);
      setIsUpdating(true);

      await withRetry(
        async () => {
          const { error: updateError } = await (
            await supabase
          )
            .from("projects")
            .update({
              archived: !project.archived,
              archived_at: !project.archived ? new Date().toISOString() : null,
            })
            .eq("id", project.id);
          if (updateError) throw updateError;
          return true;
        },
        { maxAttempts: 3, delayMs: 1000 }
      );

      setProjects((prev) =>
        prev.map((p) =>
          p.id === project.id
            ? {
                ...p,
                archived: !p.archived,
                archived_at: !p.archived ? new Date().toISOString() : null,
              }
            : p
        )
      );

      setNotification({
        message: `Project ${
          project.archived ? "unarchived" : "archived"
        } successfully`,
        type: "success",
      });
    } catch (error) {
      console.error("[ProjectsList] Toggle archive error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update project status. Please try again."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredProjects = projects.filter(
    (project) => project.archived === showArchived
  );

  return (
    <AdminGuard user={user}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
            <p className="mt-2 text-sm text-slate-700">
              A list of all projects in the system.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex items-center gap-4">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
            >
              {showArchived ? (
                <>
                  <LuArchiveRestore className="h-4 w-4" />
                  Show Active
                </>
              ) : (
                <>
                  <LuArchive className="h-4 w-4" />
                  Show Archived
                </>
              )}
            </button>
            <Link
              href="/admin/projects/new"
              className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              <LuPlus className="h-4 w-4" />
              Add Project
            </Link>
          </div>
        </div>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900">
                      Project Name
                    </th>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900">
                      Client
                    </th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900">
                        <span
                          className={
                            project.archived
                              ? "line-through text-slate-500"
                              : ""
                          }
                        >
                          {project.name}
                        </span>
                        {project.archived && project.archived_at && (
                          <span className="ml-2 text-xs text-slate-500">
                            (Archived{" "}
                            {new Date(project.archived_at).toLocaleDateString()}
                            )
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-slate-900">
                        {project.client.name}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex justify-end gap-4">
                          <button
                            onClick={() => toggleArchive(project)}
                            className="text-slate-600 hover:text-slate-900"
                            disabled={isUpdating}
                          >
                            {project.archived ? "Unarchive" : "Archive"}
                          </button>
                          <Link
                            href={`/admin/projects/${project.id}`}
                            className="text-slate-600 hover:text-slate-900"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </AdminGuard>
  );
}
