"use client";

import { useState, useEffect } from "react";
import { LuLoader } from "react-icons/lu";
import Notification from "@/components/common/Notification";
import {
  TimeOffRequest,
  TimeOffType,
  SupabaseError,
} from "@/types/database.types";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import { createClient } from "@/utils/supabase/client";

interface TimeOffRequestFormProps {
  userId: string;
  initialRequest?: TimeOffRequest | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function TimeOffRequestForm({
  userId,
  initialRequest,
  onCancel,
  onSuccess,
}: TimeOffRequestFormProps) {
  const [request, setRequest] = useState<Partial<TimeOffRequest>>(
    initialRequest || {
      type: "vacation",
      status: "draft",
    }
  );
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSkeleton rows={4} columns={2} />;
  }

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!request.start_date) {
      errors.start_date = "Start date is required";
    }
    if (!request.end_date) {
      errors.end_date = "End date is required";
    }
    if (!request.description?.trim()) {
      errors.description = "Description is required";
    }
    if (!request.type) {
      errors.type = "Type is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (
    e: React.FormEvent,
    status: "draft" | "submitted"
  ) => {
    e.preventDefault();

    if (status === "submitted" && !validateForm()) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const data = {
        ...request,
        user_id: userId,
        status,
        updated_at: new Date().toISOString(),
      };

      const { error: saveError } = initialRequest
        ? await supabase
            .from("time_off_requests")
            .update(data)
            .eq("id", initialRequest.id)
        : await supabase.from("time_off_requests").insert([data]);

      if (saveError) {
        console.error("[TimeOffRequestForm] Save error:", saveError.message);
        setError("Failed to save request. Please try again.");
        return;
      }

      setNotification({
        message: `Request ${
          status === "submitted" ? "submitted" : "saved"
        } successfully`,
        type: "success",
      });

      onSuccess();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("[TimeOffForm] Error:", error.message);
      } else if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        "message" in error
      ) {
        const dbError = error as SupabaseError;
        console.error("[TimeOffForm] Database error:", {
          code: dbError.code,
          message: dbError.message,
          details: dbError.details,
        });
      } else {
        console.error("[TimeOffForm] Unknown error:", error);
      }
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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

      <div className="mt-8 max-w-2xl">
        <div className="space-y-6">
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-slate-700"
            >
              Type
            </label>
            <select
              id="type"
              value={request.type}
              onChange={(e) =>
                setRequest({ ...request, type: e.target.value as TimeOffType })
              }
              className="mt-1 block w-full rounded-md border-slate-300 text-sm focus:border-slate-500 focus:ring-slate-500 text-slate-700"
            >
              <option value="vacation">Vacation</option>
              <option value="sick">Sick Leave</option>
              <option value="personal">Personal Leave</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="start-date"
                className="block text-sm font-medium text-slate-700"
              >
                Start Date
              </label>
              <input
                type="date"
                id="start-date"
                value={request.start_date}
                onChange={(e) =>
                  setRequest({ ...request, start_date: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-slate-300 text-sm focus:border-slate-500 focus:ring-slate-500 text-slate-700"
              />
            </div>
            <div>
              <label
                htmlFor="end-date"
                className="block text-sm font-medium text-slate-700"
              >
                End Date
              </label>
              <input
                type="date"
                id="end-date"
                value={request.end_date}
                onChange={(e) =>
                  setRequest({ ...request, end_date: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-slate-300 text-sm focus:border-slate-500 focus:ring-slate-500 text-slate-700"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-slate-700"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={request.description}
              onChange={(e) =>
                setRequest({ ...request, description: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-slate-300 text-sm focus:border-slate-500 focus:ring-slate-500 text-slate-700"
              placeholder="Please provide details about your time off request..."
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="rounded-md px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, "draft")}
              disabled={isSubmitting}
              className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-200"
            >
              Save Draft
            </button>
            <button
              type="submit"
              onClick={(e) => handleSubmit(e, "submitted")}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <LuLoader className="h-4 w-4 animate-spin" />
              ) : (
                "Submit"
              )}
            </button>
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

          {Object.keys(fieldErrors).length > 0 && (
            <div className="rounded-md bg-yellow-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Please fix the following errors:
                  </h3>
                  <ul className="mt-2 list-disc pl-5 space-y-1">
                    {Object.values(fieldErrors).map((err, i) => (
                      <li key={i} className="text-sm text-yellow-700">
                        {err}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
      </div>
    </div>
  );
}
