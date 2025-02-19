"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import type { Project } from "@/types/database.types";
import { format } from "date-fns";
import { LuArchive } from "react-icons/lu";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Notification from "@/components/common/Notification";
import { AddProjectModal } from "./AddProjectModal";
import { createClient } from "@/utils/supabase/client";

export const ProjectsContent = forwardRef<
  { refresh: () => void },
  { showArchived: boolean }
>(({ showArchived }, ref) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const supabase = createClient();

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select(
          `
          *,
          client:clients (
            id,
            name
          )
        `
        )
        .eq("archived", showArchived)
        .order("name");

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("[Projects] Fetch error:", error);
      setNotification({
        message: "Failed to load projects",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [showArchived]);

  useImperativeHandle(ref, () => ({
    refresh: fetchProjects,
  }));

  const handleArchive = async () => {
    if (!selectedProject) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("projects")
        .update({ archived: !showArchived })
        .eq("id", selectedProject.id);

      if (error) throw error;

      setProjects(projects.filter((p) => p.id !== selectedProject.id));
      setNotification({
        message: `Project ${
          showArchived ? "unarchived" : "archived"
        } successfully`,
        type: "success",
      });
    } catch (error) {
      console.error("[Projects] Archive error:", error);
      setNotification({
        message: "Failed to update project",
        type: "error",
      });
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
      setSelectedProject(null);
    }
  };

  const refreshData = () => {
    fetchProjects();
  };

  return (
    <div className="mt-6 px-4 sm:px-6 lg:px-8">
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-slate-600 animate-bounce [animation-delay:-0.3s]" />
              <div className="w-4 h-4 rounded-full bg-slate-600 animate-bounce [animation-delay:-0.15s]" />
              <div className="w-4 h-4 rounded-full bg-slate-600 animate-bounce" />
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
                >
                  Client
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
                >
                  Created
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {projects.map((project) => (
                <tr key={project.id}>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-900">
                    {project.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-900">
                    {project.client?.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                    {format(new Date(project.created_at), "MMM d, yyyy")}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedProject(project);
                          setShowConfirm(true);
                        }}
                        className="text-slate-400 hover:text-slate-500"
                      >
                        <LuArchive className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setSelectedProject(null);
        }}
        onConfirm={handleArchive}
        title={showArchived ? "Unarchive Project" : "Archive Project"}
        message={`Are you sure you want to ${
          showArchived ? "unarchive" : "archive"
        } ${selectedProject?.name}?`}
      />

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <AddProjectModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={refreshData}
      />
    </div>
  );
});

ProjectsContent.displayName = "ProjectsContent";
