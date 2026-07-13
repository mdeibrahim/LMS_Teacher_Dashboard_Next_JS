"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ClipboardList, UserCheck, Search, Loader2, RefreshCw } from "lucide-react";

import { getEnrollments } from "@/services/admin/api";
import type { AdminEnrollment } from "@/services/admin/types";

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

function getStatusBadge(status: string): { label: string; className: string } {
  switch (status) {
    case "active":
      return { label: "Active", className: "bg-green-50 text-green-700" };
    case "pending":
      return { label: "Pending", className: "bg-yellow-50 text-yellow-700" };
    case "revoked":
      return { label: "Revoked", className: "bg-red-50 text-red-700" };
    default:
      return { label: status, className: "bg-slate-100 text-slate-700" };
  }
}

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<AdminEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEnrollments();
      setEnrollments(data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load enrollments");
      toast.error("Failed to load enrollments");
    } finally {
      setLoading(false);
    }
  };

  const filteredEnrollments = useMemo(() => {
    if (!search.trim()) return enrollments;

    const query = search.toLowerCase().trim();

    return enrollments.filter((enrollment) => {
      const userName = enrollment.user.full_name.toLowerCase();
      const userEmail = enrollment.user.email.toLowerCase();
      const courseName = enrollment.course.name.toLowerCase();

      return (
        userName.includes(query) ||
        userEmail.includes(query) ||
        courseName.includes(query)
      );
    });
  }, [enrollments, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <ClipboardList className="text-blue-600" size={30} />
            <h1 className="text-xl font-bold text-slate-900">
              Enrollments
            </h1>
          </div>
          <p className="mt-3 max-w-2xl text-xs text-slate-500">
            Manage course enrollments
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user email, name or course name..."
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
              onClick={loadEnrollments}
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
                    Status
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Granted At
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Updated At
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {loading && enrollments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <Loader2 className="mx-auto text-slate-400 animate-spin" size={32} />
                      <p className="mt-3 text-sm text-slate-500">Loading enrollments...</p>
                    </td>
                  </tr>
                ) : filteredEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <UserCheck className="mx-auto text-slate-300" size={48} />
                      <p className="mt-3 text-sm text-slate-500">
                        {search ? "No enrollments match your search." : "No enrollments found."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredEnrollments.map((enrollment) => {
                    const statusBadge = getStatusBadge(enrollment.status);

                    return (
                      <tr
                        key={enrollment.id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <span className="text-sm font-medium text-slate-900">
                              {enrollment.user.full_name}
                            </span>
                            <span className="block text-xs text-slate-500">
                              {enrollment.user.email}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">
                            {enrollment.course.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge.className}`}
                          >
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">
                            {formatDateTime(enrollment.granted_at)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">
                            {formatDateTime(enrollment.updated_at)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
