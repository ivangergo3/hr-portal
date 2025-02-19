"use client";

import { useState, useEffect } from "react";
import TimeOffRequestList from "./TimeOffRequestList";
import TimeOffRequestForm from "./TimeOffRequestForm";
import type { TimeOffRequestWithUser } from "@/types/database.types";
import { createClient } from "@/utils/supabase/client";

interface TimeOffContentProps {
  userId: string;
}

export function TimeOffContent({ userId }: TimeOffContentProps) {
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<TimeOffRequestWithUser[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        const { data } = await supabase
          .from("time_off_requests")
          .select(
            `
            *,
            user:users (
              id,
              email,
              full_name,
              role
            )
          `
          )
          .order("created_at", { ascending: false });

        setRequests(data || []);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [showForm]); // Refetch when form closes

  useEffect(() => {
    const handleModalTrigger = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-modal-target="new-request"]')) {
        setShowForm(true);
      }
    };
    document.addEventListener("click", handleModalTrigger);
    return () => document.removeEventListener("click", handleModalTrigger);
  }, []);

  const handleEdit = () => {
    setShowForm(true);
    // You might want to pass the request to the form component for editing
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
        {showForm ? (
          <TimeOffRequestForm
            userId={userId}
            onCancel={() => setShowForm(false)}
            onSuccess={() => setShowForm(false)}
          />
        ) : (
          <TimeOffRequestList
            requests={requests}
            isLoading={isLoading}
            onEdit={handleEdit}
          />
        )}
      </div>
    </div>
  );
}
