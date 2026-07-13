"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Search,
  Users,
  Loader2,
  GraduationCap,
} from "lucide-react";

import { getTeachers } from "@/services/admin/api";
import type { AdminTeacher } from "@/services/admin/types";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTeachers();
      setTeachers(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load teachers");
      toast.error("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTeachers();
  }, []);

  const filteredTeachers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return teachers;

    return teachers.filter((teacher) => {
      const name = (teacher.full_name || teacher.user?.full_name || "").toLowerCase();
      const email = (teacher.user?.email || "").toLowerCase();
      return name.includes(query) || email.includes(query);
    });
  }, [teachers, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Teachers</h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage all platform teachers
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Subject
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Institution
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Experience (years)
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Joined Date
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {loading && teachers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Loader2
                      className="mx-auto text-slate-400 animate-spin"
                      size={32}
                    />
                    <p className="mt-3 text-sm text-slate-500">
                      Loading teachers...
                    </p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <p className="text-sm text-slate-500">{error}</p>
                    <button
                      onClick={() => void loadTeachers()}
                      className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Retry
                    </button>
                  </td>
                </tr>
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Users className="mx-auto text-slate-300" size={48} />
                    <p className="mt-3 text-sm text-slate-500">
                      {search
                        ? "No teachers found matching your search."
                        : "No teachers found."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => {
                  const avatarUrl = teacher.profile_picture;
                  const displayName =
                    teacher.full_name || teacher.user?.full_name || "Unnamed";
                  const email = teacher.user?.email || "-";

                  return (
                    <tr
                      key={teacher.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={avatarUrl}
                              alt={displayName}
                              className="h-9 w-9 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                              <span className="text-xs font-semibold">
                                {getInitials(displayName)}
                              </span>
                            </div>
                          )}
                          <span className="text-sm font-medium text-slate-900">
                            {displayName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{email}</span>
                      </td>
                      <td className="px-6 py-4">
                        {teacher.teacher_subject ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                            <GraduationCap size={13} />
                            {teacher.teacher_subject}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">
                          {teacher.teacher_institution || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">
                          {teacher.teacher_experience_years !== null &&
                          teacher.teacher_experience_years !== undefined
                            ? teacher.teacher_experience_years
                            : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">
                          {formatDate(teacher.created_at)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
