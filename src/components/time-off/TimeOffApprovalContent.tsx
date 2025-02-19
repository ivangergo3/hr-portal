"use client";

import { useState, useEffect } from "react";
import type {
  TimeOffRequestWithUser,
  TimeOffStatus,
} from "@/types/database.types";
import { format } from "date-fns";
import { LuCheck, LuX } from "react-icons/lu";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Notification from "@/components/common/Notification";
import { createClient } from "@/utils/supabase/client";

interface TimeOffApprovalContentProps {
  userId: string;
}

export function TimeOffApprovalContent({}: TimeOffApprovalContentProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<TimeOffRequestWithUser[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | TimeOffStatus>(
    "submitted"
  );
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedAction, setSelectedAction] = useState<
    "approve" | "reject" | null
  >(null);
  const [selectedRequest, setSelectedRequest] =
    useState<TimeOffRequestWithUser | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        const query = supabase
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

        // Only apply status filter if not "all"
        if (statusFilter !== "all") {
          query.eq("status", statusFilter);
        }

        const { data } = await query;
        setRequests(data || []);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [statusFilter]); // Add statusFilter as dependency

  const handleAction = async () => {
    if (!selectedRequest || !selectedAction) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("time_off_requests")
        .update({
          status: selectedAction === "approve" ? "approved" : "rejected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedRequest.id);

      if (error) throw error;

      setRequests(
        requests.map((r) =>
          r.id === selectedRequest.id
            ? {
                ...r,
                status: selectedAction === "approve" ? "approved" : "rejected",
              }
            : r
        )
      );

      setNotification({
        message: `Request ${
          selectedAction === "approve" ? "approved" : "rejected"
        } successfully`,
        type: "success",
      });
    } catch (error) {
      console.error("[TimeOffApproval] Action error:", error);
      setNotification({
        message: "Failed to process request",
        type: "error",
      });
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
      setSelectedAction(null);
      setSelectedRequest(null);
    }
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

        <div className="mb-4 flex justify-end">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | TimeOffStatus)
            }
            className="rounded-md border-slate-300 text-sm focus:border-slate-500 focus:ring-slate-500 text-slate-900"
          >
            <option value="all">All Requests</option>
            <option value="submitted">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="draft">Drafts</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
                >
                  Employee
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
                >
                  Dates
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {requests.map((request) => (
                <tr key={request.id}>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                    {request.user.full_name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                    {request.type}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                    {format(new Date(request.start_date), "MMM d")} -{" "}
                    {format(new Date(request.end_date), "MMM d, yyyy")}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                          request.status === "submitted"
                            ? "bg-yellow-50 text-yellow-700"
                            : request.status === "approved"
                            ? "bg-green-50 text-green-700"
                            : request.status === "rejected"
                            ? "bg-red-50 text-red-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {request.status}
                      </span>
                      {request.status === "submitted" && (
                        <div className="flex gap-2 ml-6">
                          <button
                            onClick={() => {
                              setSelectedAction("approve");
                              setSelectedRequest(request);
                              setShowConfirm(true);
                            }}
                            className="text-green-600 hover:text-green-800"
                            title="Approve request"
                          >
                            <LuCheck className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAction("reject");
                              setSelectedRequest(request);
                              setShowConfirm(true);
                            }}
                            className="text-red-600 hover:text-red-800"
                            title="Reject request"
                          >
                            <LuX className="h-4 w-4" />
                          </button>
                        </div>
                      )}
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
          setSelectedAction(null);
          setSelectedRequest(null);
        }}
        onConfirm={handleAction}
        title={`${selectedAction === "approve" ? "Approve" : "Reject"} Request`}
        message={`Are you sure you want to ${selectedAction} this request from ${selectedRequest?.user.full_name}?`}
      />

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
