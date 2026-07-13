"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Smartphone, Monitor, Search, Loader2, RefreshCw } from "lucide-react";

import { getDeviceSessions } from "@/services/admin/api";
import type { AdminDeviceSession, PaginatedResponse } from "@/services/admin/types";

function getDeviceIcon(userAgent: string) {
  const ua = userAgent.toLowerCase();
  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
    return <Smartphone className="text-slate-400" size={16} />;
  }
  return <Monitor className="text-slate-400" size={16} />;
}

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

export default function AdminDeviceSessionsPage() {
  const [sessions, setSessions] = useState<AdminDeviceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);

  const buildQuery = () => {
    return {
      page,
      limit,
      search: search || undefined,
    };
  };

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data: PaginatedResponse<AdminDeviceSession> = await getDeviceSessions(buildQuery());
      setSessions(data.data);
      setPage(data.pagination.page);
      setPages(data.pagination.pages);
      setTotal(data.pagination.total);
    } catch (err) {
      console.error(err);
      setError("Failed to load device sessions");
      toast.error("Failed to load device sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSessions();
  }, [search, limit]);

  useEffect(() => {
    if (page === 1) return;
    void fetchPage(page);
  }, [page]);

  async function fetchPage(pageNum: number) {
    try {
      setLoading(true);
      setError(null);
      const data: PaginatedResponse<AdminDeviceSession> = await getDeviceSessions({
        ...buildQuery(),
        page: pageNum,
      });
      setSessions(data.data);
      setPage(data.pagination.page);
      setPages(data.pagination.pages);
      setTotal(data.pagination.total);
    } catch (err) {
      console.error(err);
      setError("Failed to load device sessions");
      toast.error("Failed to load device sessions");
    } finally {
      setLoading(false);
    }
  }

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleRetry = () => {
    void loadSessions();
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
            <Smartphone className="text-blue-600" size={30} />
            <h1 className="text-xl font-bold text-slate-900">
              Device Sessions
            </h1>
          </div>
          <p className="mt-3 max-w-2xl text-xs text-slate-500">
            Monitor and manage user device sessions
          </p>
        </div>
      </div>

      {/* Search */}
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
                    JTI
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    User Agent
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Last Seen
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Expires At
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {loading && sessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <Loader2 className="mx-auto text-slate-400 animate-spin" size={32} />
                      <p className="mt-3 text-sm text-slate-500">Loading device sessions...</p>
                    </td>
                  </tr>
                ) : sessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <Smartphone className="mx-auto text-slate-300" size={48} />
                      <p className="mt-3 text-sm text-slate-500">
                        No device sessions found.
                      </p>
                    </td>
                  </tr>
                ) : (
                  sessions.map((session) => (
                    <tr
                      key={session.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <span className="text-sm font-medium text-slate-900">
                            {session.user.full_name}
                          </span>
                          <span className="block text-xs text-slate-500">
                            {session.user.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 font-mono">
                          {truncate(session.jti, 16)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 max-w-xs">
                          {getDeviceIcon(session.user_agent)}
                          <span className="text-sm text-slate-600 truncate" title={session.user_agent}>
                            {truncate(session.user_agent, 40)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 font-mono">
                          {session.ip_address || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">
                          {formatDateTime(session.last_seen)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">
                          {formatDateTime(session.expires_at)}
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
              Showing {total} session{total !== 1 ? "s" : ""}
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
