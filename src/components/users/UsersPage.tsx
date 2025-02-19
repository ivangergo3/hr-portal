"use client";

import { useState } from "react";
import { User, Role, SupabaseError } from "@/types/database.types";
import UsersList from "./UsersList";
import InviteUserForm from "./InviteUserForm";
import { LuUserPlus } from "react-icons/lu";
import Notification from "@/components/common/Notification";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { createClient } from "@/utils/supabase/client";
interface UsersPageProps {
  currentUser: User;
  users: User[];
}

export default function UsersPage({
  currentUser,
  users: initialUsers,
}: UsersPageProps) {
  const [users, setUsers] = useState(initialUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const supabase = createClient();

  const handleRoleChange = async (newRole: Role) => {
    if (!selectedUser) return;

    try {
      setError(null);

      const { error: updateError } = await supabase
        .from("users")
        .update({ role: newRole })
        .eq("id", selectedUser.id);

      if (updateError) {
        console.error("[UsersPage] Role update error:", updateError.message);
        setError("Failed to update user role. Please try again.");
        return;
      }

      // Update local state
      setUsers((current) =>
        current.map((u) =>
          u.id === selectedUser.id ? { ...u, role: newRole } : u
        )
      );

      setNotification({
        message: `Role updated successfully for ${
          selectedUser.full_name || selectedUser.email
        }`,
        type: "success",
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("[UsersPage] Error:", error.message);
      } else if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        "message" in error
      ) {
        const dbError = error as SupabaseError;
        console.error("[UsersPage] Database error:", {
          code: dbError.code,
          message: dbError.message,
          details: dbError.details,
        });
      } else {
        console.error("[UsersPage] Unknown error:", error);
      }
      setError("Failed to update user role. Please try again.");
    } finally {
      setShowRoleDialog(false);
      setSelectedUser(null);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
          <p className="mt-2 text-sm text-slate-700">
            Manage users and their roles in the system.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowInviteForm(true)}
            className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-700"
          >
            <LuUserPlus className="h-4 w-4" />
            Invite User
          </button>
        </div>
      </div>

      {showInviteForm ? (
        <InviteUserForm
          onCancel={() => setShowInviteForm(false)}
          onSuccess={() => {
            setShowInviteForm(false);
            window.location.reload();
          }}
        />
      ) : (
        <UsersList users={users} currentUserId={currentUser.id} />
      )}

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

      <ConfirmDialog
        isOpen={showRoleDialog}
        onClose={() => {
          setShowRoleDialog(false);
          setSelectedUser(null);
        }}
        onConfirm={() =>
          handleRoleChange(
            selectedUser?.role === "admin" ? "employee" : "admin"
          )
        }
        title="Change User Role"
        message={`Are you sure you want to change ${
          selectedUser?.full_name || selectedUser?.email
        }'s role to ${selectedUser?.role === "admin" ? "employee" : "admin"}?`}
      />
    </div>
  );
}
