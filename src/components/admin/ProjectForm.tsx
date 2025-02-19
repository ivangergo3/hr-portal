"use client";

import { Project, Client } from "@/types/database.types";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import { createClientServer } from "@/utils/supabase/server";

type Props = {
  initialData?: Project;
  clients: Client[];
  mode: "create" | "edit";
};

export default function ProjectForm({ initialData, clients, mode }: Props) {
  const [name, setName] = useState(initialData?.name || "");
  const [clientId, setClientId] = useState(initialData?.client_id || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClientServer();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSkeleton rows={4} columns={2} />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      if (mode === "create") {
        const { error: createError } = await (await supabase)
          .from("projects")
          .insert([{ name, client_id: clientId }]);

        if (createError) {
          if (createError.code === "23505") {
            setError(
              "A project with this name already exists for this client."
            );
            return;
          }
          setError("Failed to create project. Please try again.");
          return;
        }
      } else {
        const { error: updateError } = await (
          await supabase
        )
          .from("projects")
          .update({
            name,
            client_id: clientId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", initialData?.id);

        if (updateError) {
          if (updateError.code === "23505") {
            setError(
              "A project with this name already exists for this client."
            );
            return;
          }
          setError("Failed to update project. Please try again.");
          return;
        }
      }

      router.refresh();
      router.push("/admin/projects");
    } catch (error) {
      console.error("Error saving project:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <div>
        <label
          htmlFor="client"
          className="block text-sm font-medium text-slate-900"
        >
          Client
        </label>
        <select
          id="client"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
          required
        >
          <option value="">Select a client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-slate-900"
        >
          Project Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`mt-1 block w-full rounded-md border ${
            error ? "border-red-300" : "border-slate-300"
          } px-3 py-2 text-slate-900 bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400`}
          placeholder="Enter project name"
          required
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {isSaving
            ? "Saving..."
            : mode === "create"
            ? "Create Project"
            : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/projects")}
          className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
