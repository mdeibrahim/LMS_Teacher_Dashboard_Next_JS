"use client";

import { useEffect, useState } from "react";
import { Users, Search, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { getStudents } from "@/services/admin/api";
import type { AdminStudent } from "@/services/admin/types";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getStudents();
      setStudents(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch students";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter((student) => {
    const query = searchQuery.toLowerCase();
    const fullName = student.full_name?.toLowerCase() ?? "";
    const email = student.user?.email?.toLowerCase() ?? "";
    return fullName.includes(query) || email.includes(query);
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="flex flex-wrap items-start justify-between gap-6">

        <div>
          <div className="flex items-center gap-3">
            <Users
              className="text-blue-600"
              size={30}
            />

            <h1 className="text-xl font-bold text-slate-900">
              Students
            </h1>
          </div>

          <p className="mt-3 max-w-2xl text-xs text-slate-500">
            Manage all platform students
          </p>
        </div>

      </div>

      {/* Search */}

      <div className="relative max-w-md">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={16}
        />

        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
        />
      </div>

      {/* Table */}

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full text-left text-sm">

            <thead>

              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Name
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Email
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Institution
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Level
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Joined Date
                </th>
              </tr>

            </thead>

            <tbody className="divide-y divide-slate-200">

              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-sm text-slate-500"
                  >
                    Loading students...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-sm text-red-600"
                  >
                    {error}
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-sm text-slate-500"
                  >
                    {searchQuery
                      ? "No students match your search."
                      : "No students found."}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {student.profile_picture ? (
                          <img
                            src={student.profile_picture}
                            alt={student.full_name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                            {getInitials(student.full_name)}
                          </div>
                        )}

                        <span className="font-medium text-slate-900">
                          {student.full_name || student.user?.full_name || "-"}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {student.user?.email || "-"}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {student.student_institution || "-"}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {student.student_level || "-"}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(student.created_at)}
                    </td>
                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}
