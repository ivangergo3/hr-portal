"use client";

import { useState, useEffect } from "react";
import { LuLoader } from "react-icons/lu";
import Modal from "@/components/common/Modal";
import type { Client } from "@/types/database.types";
import { createClient } from "@/utils/supabase/client";

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddProjectModal({
  isOpen,
  onClose,
  onSuccess,
}: AddProjectModalProps) {
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("clients")
          .select("*")
          .eq("archived", false)
          .order("name");

        if (error) throw error;
        setClients(data || []);
      } catch (error) {
        console.error("[AddProject] Clients fetch error:", error);
        setError("Failed to load clients");
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchClients();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !clientId) {
      setError("Project name and client are required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const { error: insertError } = await supabase
        .from("projects")
        .insert([{ name: name.trim(), client_id: clientId }]);

      if (insertError) throw insertError;

      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error("[AddProject] Submit error:", error);
      setError("Failed to add project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName("");
    setClientId("");
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-slate-700"
          >
            Project Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm text-slate-900"
            placeholder="Enter project name"
          />
        </div>

        <div>
          <label
            htmlFor="client"
            className="block text-sm font-medium text-slate-700"
          >
            Client
          </label>
          <select
            id="client"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm text-slate-900"
            disabled={isLoading}
          >
            <option value="">Select a client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {isSubmitting ? (
              <LuLoader className="h-4 w-4 animate-spin" />
            ) : (
              "Add Project"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
