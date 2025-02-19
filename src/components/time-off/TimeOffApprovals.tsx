"use client";

import { useState, useEffect } from "react";
import { TimeOffRequestWithUser, TimeOffStatus } from "@/types/database.types";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import EmptyState from "@/components/common/EmptyState";

interface TimeOffApprovalsProps {
  requests: TimeOffRequestWithUser[];
}

export default function TimeOffApprovals({ requests }: TimeOffApprovalsProps) {
  const [statusFilter, setStatusFilter] = useState<"all" | TimeOffStatus>(
    "all"
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSkeleton rows={5} columns={4} />;
  }

  if (requests.length === 0) {
    return (
      <EmptyState
        title="No pending requests"
        message="There are no time off requests to review."
      />
    );
  }

  const filteredRequests =
    statusFilter === "all"
      ? requests
      : requests.filter((request) => request.status === statusFilter);

  return (
    <div className="mt-8 flow-root">
      <div className="mb-4 flex justify-end">
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "all" | TimeOffStatus)
          }
          className="rounded-md border-slate-300 text-sm focus:border-slate-500 focus:ring-slate-500"
        >
          <option value="all">All Requests</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <table className="min-w-full divide-y divide-slate-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
              User
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {filteredRequests.map((request) => (
            <tr key={request.id}>
              <td className="px-6 py-4 text-sm text-slate-500">
                {request.user.full_name}
              </td>
              <td className="px-6 py-4 text-sm text-slate-500">
                {request.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
