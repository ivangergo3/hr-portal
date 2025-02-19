"use client";

import { useState } from "react";
import { TimeOffRequestWithUser, TimeOffStatus } from "@/types/database.types";
import { format } from "date-fns";
import { LuPencil } from "react-icons/lu";

interface TimeOffRequestListProps {
  requests: TimeOffRequestWithUser[];
  onEdit?: (request: TimeOffRequestWithUser) => void;
  isLoading: boolean;
}

export default function TimeOffRequestList({
  requests,
  onEdit,
  isLoading,
}: TimeOffRequestListProps) {
  const [statusFilter, setStatusFilter] = useState<"all" | TimeOffStatus>(
    "all"
  );

  const filteredRequests =
    statusFilter === "all"
      ? requests
      : requests.filter((request) => request.status === statusFilter);

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

      <div className="mb-4 flex justify-end">
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "all" | TimeOffStatus)
          }
          className="rounded-md border-slate-300 text-sm focus:border-slate-500 focus:ring-slate-500 text-slate-900"
          disabled={isLoading}
        >
          <option value="all">All Requests</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200">
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-0"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-0"
                    >
                      Start Date
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
                    >
                      End Date
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
                    >
                      Description
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
                  {filteredRequests.map((request) => (
                    <tr key={request.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-0">
                        {request.type.charAt(0).toUpperCase() +
                          request.type.slice(1)}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-0">
                        {format(new Date(request.start_date), "MMM d, yyyy")}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                        {format(new Date(request.end_date), "MMM d, yyyy")}
                      </td>
                      <td className="px-3 py-4 text-sm text-slate-500">
                        {request.description}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <div className="flex items-center gap-3">
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
                            {request.status.charAt(0).toUpperCase() +
                              request.status.slice(1)}
                          </span>
                          {request.status === "draft" && (
                            <button
                              onClick={() => onEdit?.(request)}
                              className="text-slate-400 hover:text-slate-600"
                              title="Edit request"
                            >
                              <LuPencil className="h-4 w-4" />
                            </button>
                          )}
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
    </div>
  );
}
