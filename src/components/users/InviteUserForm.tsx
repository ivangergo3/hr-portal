"use client";

import { useState } from "react";
import { Role } from "@/types/database.types";
import { LuLoader, LuSend } from "react-icons/lu";
import Notification from "@/components/common/Notification";
import { createClient } from "@/utils/supabase/client";

interface InviteUserFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export default function InviteUserForm({
  onCancel,
  onSuccess,
}: InviteUserFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    role: "employee" as Role,
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const supabase = createClient();

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.full_name?.trim()) {
      errors.full_name = "Full name is required";
    }

    if (!formData.role) {
      errors.role = "Role is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Please fix the validation errors before submitting");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // First check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("email", formData.email)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 means no rows returned, which is what we want
        console.error("[InviteUserForm] Check error:", checkError.message);
        setError("Failed to check existing user. Please try again.");
        return;
      }

      if (existingUser) {
        setError("A user with this email already exists");
        return;
      }

      // Create user in users table first
      const { error: createError } = await supabase.from("users").insert([
        {
          email: formData.email,
          full_name: formData.full_name,
          role: formData.role,
        },
      ]);

      if (createError) {
        console.error("[InviteUserForm] Create error:", createError.message);
        setError("Failed to create user. Please try again.");
        return;
      }

      // Send invitation
      const { error: inviteError } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          data: {
            full_name: formData.full_name,
            role: formData.role,
          },
        },
      });

      if (inviteError) {
        console.error("[InviteUserForm] Invite error:", inviteError.message);
        setError("Failed to send invitation. Please try again.");
        return;
      }

      setNotification({
        message: "Invitation sent successfully",
        type: "success",
      });

      onSuccess();
    } catch (error) {
      console.error("[InviteUserForm] Submit error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-700"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
          className={`mt-1 block w-full rounded-md border-slate-300 text-sm 
            focus:border-slate-500 focus:ring-slate-500 text-slate-900
            ${fieldErrors.email ? "border-red-300" : ""}`}
          disabled={isSubmitting}
        />
        {fieldErrors.email && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="full_name"
          className="block text-sm font-medium text-slate-700"
        >
          Full Name
        </label>
        <input
          type="text"
          id="full_name"
          value={formData.full_name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, full_name: e.target.value }))
          }
          className={`mt-1 block w-full rounded-md border-slate-300 text-sm 
            focus:border-slate-500 focus:ring-slate-500 text-slate-900
            ${fieldErrors.full_name ? "border-red-300" : ""}`}
          disabled={isSubmitting}
        />
        {fieldErrors.full_name && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.full_name}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="role"
          className="block text-sm font-medium text-slate-700"
        >
          Role
        </label>
        <select
          id="role"
          value={formData.role}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, role: e.target.value as Role }))
          }
          className={`mt-1 block w-full rounded-md border-slate-300 text-sm text-slate-900
            focus:border-slate-500 focus:ring-slate-500 
            ${fieldErrors.role ? "border-red-300" : ""}`}
          disabled={isSubmitting}
        >
          <option value="employee">Employee</option>
          <option value="admin">Admin</option>
        </select>
        {fieldErrors.role && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.role}</p>
        )}
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-md px-3 py-2 text-sm font-semibold text-slate-900 
            hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-md bg-slate-800 
            px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700 
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <LuLoader className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <LuSend className="h-4 w-4" />
              Send Invitation
            </>
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

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </form>
  );
}
