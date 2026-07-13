"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Search,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import { getPaymentSubmissions, updatePaymentSubmission } from "@/services/admin/api";
import type {
  AdminPaymentSubmission,
  PaginatedResponse,
} from "@/services/admin/types";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}...`;
}

function formatDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function getPaymentMethodColor(method: string): string {
  const value = method.toLowerCase();
  if (value.includes("bkash")) return "bg-pink-50 text-pink-700";
  if (value.includes("nagad")) return "bg-orange-50 text-orange-700";
  if (value.includes("rocket")) return "bg-purple-50 text-purple-700";
  if (value.includes("card")) return "bg-indigo-50 text-indigo-700";
  if (value.includes("bank")) return "bg-teal-50 text-teal-700";
  return "bg-slate-100 text-slate-700";
}

function getStatusBadge(status: string): { label: string; className: string } {
  switch (status) {
    case "approved":
      return { label: "Approved", className: "bg-green-50 text-green-700" };
    case "rejected":
      return { label: "Rejected", className: "bg-red-50 text-red-700" };
    default:
      return { label: "Pending", className: "bg-yellow-50 text-yellow-700" };
  }
}

export default function AdminPaymentSubmissionsPage() {
  const [submissions, setSubmissions] = useState<AdminPaymentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);

  const [actionId, setActionId] = useState<number | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<AdminPaymentSubmission | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const buildQuery = () => {
    return {
      page,
      limit,
      search: search || undefined,
      status: status !== "all" ? status : undefined,
    };
  };

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data: PaginatedResponse<AdminPaymentSubmission> =
        await getPaymentSubmissions(buildQuery());
      setSubmissions(data.data);
      setPage(data.pagination.page);
      setPages(data.pagination.pages);
      setTotal(data.pagination.total);
    } catch (err) {
      console.error(err);
      setError("Failed to load payment submissions");
      toast.error("Failed to load payment submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSubmissions();
  }, [search, status, limit]);

  useEffect(() => {
    if (page === 1) return;
    void fetchPage(page);
  }, [page]);

  async function fetchPage(pageNum: number) {
    try {
      setLoading(true);
      setError(null);
      const data: PaginatedResponse<AdminPaymentSubmission> =
        await getPaymentSubmissions({
          ...buildQuery(),
          page: pageNum,
        });
      setSubmissions(data.data);
      setPage(data.pagination.page);
      setPages(data.pagination.pages);
      setTotal(data.pagination.total);
    } catch (err) {
      console.error(err);
      setError("Failed to load payment submissions");
      toast.error("Failed to load payment submissions");
    } finally {
      setLoading(false);
    }
  }

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: StatusFilter) => {
    setStatus(value);
    setPage(1);
  };

  const handleRetry = () => {
    void loadSubmissions();
  };

  const handleApprove = async (submission: AdminPaymentSubmission) => {
    try {
      setActionId(submission.id);
      const data = await updatePaymentSubmission(submission.id, {
        status: "approved",
      });
      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === submission.id ? data.data : item
        )
      );
      toast.success("Payment submission approved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve submission");
    } finally {
      setActionId(null);
    }
  };

  const openRejectModal = (submission: AdminPaymentSubmission) => {
    setRejectTarget(submission);
    setRejectionReason("");
    setRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    if (rejecting) return;
    setRejectModalOpen(false);
    setRejectTarget(null);
    setRejectionReason("");
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    if (!rejectionReason.trim()) {
      toast.error("Please enter a rejection reason");
      return;
    }
    try {
      setRejecting(true);
      const data = await updatePaymentSubmission(rejectTarget.id, {
        status: "rejected",
        rejection_reason: rejectionReason.trim(),
      });
      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === rejectTarget.id ? data.data : item
        )
      );
      toast.success("Payment submission rejected");
      setRejectModalOpen(false);
      setRejectTarget(null);
      setRejectionReason("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject submission");
    } finally {
      setRejecting(false);
    }
  };

  const pageNumbers = useMemo(() => {
    const numbers: (number | string)[] = [];
    const maxVisible = 5;

    if (pages <= maxVisible + 2) {
      for (let i = 1; i <= pages; i++) numbers.push(i);
    } else {
      numbers.push(1);
      if (page > 3) numbers.push("...");

      const start = Math.max(2, page - 1);
      const end = Math.min(pages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        numbers.push(i);
      }

      if (page < pages - 2) numbers.push("...");
      numbers.push(pages);
    }

    return numbers;
  }, [page, pages]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <CreditCard className="text-blue-600" size={30} />
            <h1 className="text-xl font-bold text-slate-900">
              Payment Submissions
            </h1>
          </div>
          <p className="mt-3 max-w-2xl text-xs text-slate-500">
            Review and manage payment submissions
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by user email, name or transaction ID..."
              className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as StatusFilter)}
            className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {error && !loading ? (
          <div className="flex flex-col items-center justify-center px-6 py-16">
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Submitted At
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {loading && submissions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <Loader2 className="mx-auto text-slate-400 animate-spin" size={32} />
                      <p className="mt-3 text-sm text-slate-500">Loading payment submissions...</p>
                    </td>
                  </tr>
                ) : submissions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <CreditCard className="mx-auto text-slate-300" size={48} />
                      <p className="mt-3 text-sm text-slate-500">
                        No payment submissions found.
                      </p>
                    </td>
                  </tr>
                ) : (
                  submissions.map((submission) => {
                    const statusBadge = getStatusBadge(submission.status);
                    const isPending = submission.status === "pending";
                    const isProcessing = actionId === submission.id;

                    return (
                      <tr
                        key={submission.id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <span className="text-sm font-medium text-slate-900">
                              {submission.user.full_name}
                            </span>
                            <span className="block text-xs text-slate-500">
                              {submission.user.email}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">
                            {submission.course.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getPaymentMethodColor(
                              submission.payment_method
                            )}`}
                          >
                            {submission.payment_method}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="text-sm text-slate-600 font-mono"
                            title={submission.transaction_id}
                          >
                            {truncate(submission.transaction_id, 14)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge.className}`}
                          >
                            {submission.status === "approved" ? (
                              <CheckCircle size={12} />
                            ) : submission.status === "rejected" ? (
                              <XCircle size={12} />
                            ) : (
                              <AlertCircle size={12} />
                            )}
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">
                            {formatDateTime(submission.submitted_at)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {isPending ? (
                              <>
                                <button
                                  onClick={() => handleApprove(submission)}
                                  disabled={isProcessing}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  {isProcessing ? (
                                    <Loader2 size={14} className="animate-spin" />
                                  ) : (
                                    <CheckCircle size={14} />
                                  )}
                                  Approve
                                </button>
                                <button
                                  onClick={() => openRejectModal(submission)}
                                  disabled={isProcessing}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  <XCircle size={14} />
                                  Reject
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-slate-400">
                                {submission.status === "rejected" && submission.rejection_reason
                                  ? "Rejected"
                                  : "Reviewed"}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && !error && (
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
            <p className="text-sm text-slate-500">
              Showing {total} submission{total !== 1 ? "s" : ""}
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>

              {pageNumbers.map((num, idx) =>
                typeof num === "string" ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 text-sm text-slate-400"
                  >
                    {num}
                  </span>
                ) : (
                  <button
                    key={num}
                    onClick={() => setPage(num)}
                    disabled={loading}
                    className={`min-w-[36px] h-9 rounded-xl text-sm font-medium transition-colors ${
                      page === num
                        ? "bg-blue-600 text-white"
                        : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {num}
                  </button>
                )
              )}

              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages || loading}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {rejectModalOpen && rejectTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
          onClick={closeRejectModal}
        >
          <div
            className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-4">
              <XCircle className="text-red-600" size={22} />
              <h2 className="text-base font-semibold text-slate-900">
                Reject Submission
              </h2>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="text-sm text-slate-600">
                <span className="font-medium text-slate-900">
                  {rejectTarget.user.full_name}
                </span>{" "}
                &mdash; {rejectTarget.course.name}
              </div>

              <div>
                <label
                  htmlFor="rejection-reason"
                  className="block text-xs font-medium text-slate-600 mb-1.5"
                >
                  Rejection Reason
                </label>
                <textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  placeholder="Explain why this submission is being rejected..."
                  className="w-full resize-none border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
              <button
                onClick={closeRejectModal}
                disabled={rejecting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejecting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {rejecting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <XCircle size={16} />
                )}
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
