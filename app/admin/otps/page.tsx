"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Key, Mail, MessageSquare, Search, Loader2, RefreshCw } from "lucide-react";

import { getOTPs } from "@/services/admin/api";
import type { AdminOTP, PaginatedResponse } from "@/services/admin/types";

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

export default function AdminOTPsPage() {
  const [otps, setOtps] = useState<AdminOTP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState("all");
  const [isUsed, setIsUsed] = useState("all");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);

  const buildQuery = () => {
    return {
      page,
      limit,
      search: search || undefined,
      channel: channel !== "all" ? channel : undefined,
      is_used: isUsed !== "all" ? isUsed === "used" : undefined,
    };
  };

  const loadOtps = async () => {
    try {
      setLoading(true);
      setError(null);
      const data: PaginatedResponse<AdminOTP> = await getOTPs(buildQuery());
      setOtps(data.data);
      setPage(data.pagination.page);
      setPages(data.pagination.pages);
      setTotal(data.pagination.total);
    } catch (err) {
      console.error(err);
      setError("Failed to load OTP records");
      toast.error("Failed to load OTP records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOtps();
  }, [search, channel, isUsed, limit]);

  useEffect(() => {
    if (page === 1) return;
    void fetchPage(page);
  }, [page]);

  async function fetchPage(pageNum: number) {
    try {
      setLoading(true);
      setError(null);
      const data: PaginatedResponse<AdminOTP> = await getOTPs({
        ...buildQuery(),
        page: pageNum,
      });
      setOtps(data.data);
      setPage(data.pagination.page);
      setPages(data.pagination.pages);
      setTotal(data.pagination.total);
    } catch (err) {
      console.error(err);
      setError("Failed to load OTP records");
      toast.error("Failed to load OTP records");
    } finally {
      setLoading(false);
    }
  }

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleChannelChange = (value: string) => {
    setChannel(value);
    setPage(1);
  };

  const handleUsedChange = (value: string) => {
    setIsUsed(value);
    setPage(1);
  };

  const handleRetry = () => {
    void loadOtps();
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
            <Key className="text-blue-600" size={30} />
            <h1 className="text-xl font-bold text-slate-900">
              OTPs
            </h1>
          </div>
          <p className="mt-3 max-w-2xl text-xs text-slate-500">
            Manage and monitor OTP records
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
              placeholder="Search by user email or name..."
              className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>
          <select
            value={channel}
            onChange={(e) => handleChannelChange(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-white"
          >
            <option value="all">All Channels</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
          </select>
          <select
            value={isUsed}
            onChange={(e) => handleUsedChange(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-white"
          >
            <option value="all">All Status</option>
            <option value="used">Used</option>
            <option value="unused">Unused</option>
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
                    Code
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Channel
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Used
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Expires At
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {loading && otps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <Loader2 className="mx-auto text-slate-400 animate-spin" size={32} />
                      <p className="mt-3 text-sm text-slate-500">Loading OTP records...</p>
                    </td>
                  </tr>
                ) : otps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <Key className="mx-auto text-slate-300" size={48} />
                      <p className="mt-3 text-sm text-slate-500">
                        No OTP records found.
                      </p>
                    </td>
                  </tr>
                ) : (
                  otps.map((otp) => (
                    <tr
                      key={otp.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <span className="text-sm font-medium text-slate-900">
                            {otp.user.full_name}
                          </span>
                          <span className="block text-xs text-slate-500">
                            {otp.user.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 font-mono">
                          {otp.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                            otp.channel === "email"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-green-50 text-green-700"
                          }`}
                        >
                          {otp.channel === "email" ? (
                            <Mail size={12} />
                          ) : (
                            <MessageSquare size={12} />
                          )}
                          {otp.channel === "email" ? "Email" : "SMS"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                            otp.is_used
                              ? "bg-green-50 text-green-700"
                              : "bg-yellow-50 text-yellow-700"
                          }`}
                        >
                          {otp.is_used ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">
                          {formatDateTime(otp.created_at)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">
                          {formatDateTime(otp.expires_at)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && !error && (
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
            <p className="text-sm text-slate-500">
              Showing {total} OTP{total !== 1 ? "s" : ""}
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
    </div>
  );
}
