"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, Edit, Trash2, Users, ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";

import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} from "@/services/admin/api";
import type {
  User,
  UserUpdateData,
  PaginatedResponse,
} from "@/services/admin/types";

type RoleFilter = "all" | "teacher" | "student" | "admin";
type StaffFilter = "all" | "staff" | "non-staff";

type FormState = {
  mode: "edit";
  id: number;
  full_name: string;
  phone_number: string;
  role: string;
  is_active: boolean;
  is_staff: boolean;
  is_verified: boolean;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [staffFilter, setStaffFilter] = useState<StaffFilter>("all");

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);

  const [editForm, setEditForm] = useState<FormState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const buildQuery = () => {
    const params: Record<string, string | number | boolean | undefined> = {
      page,
      limit,
      search: search || undefined,
    };

    if (roleFilter !== "all") {
      params.role = roleFilter;
    }

    if (staffFilter === "staff") {
      params.is_staff = true;
    } else if (staffFilter === "non-staff") {
      params.is_staff = false;
    }

    return params;
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = buildQuery();
      const data: PaginatedResponse<User> = await getUsers(params as any);
      setUsers(data.data);
      setPage(data.pagination.page);
      setPages(data.pagination.pages);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleFilter, staffFilter, limit]);

  useEffect(() => {
    if (page === 1) return;
    void fetchPage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function fetchPage(pageNum: number) {
    try {
      setLoading(true);
      const params = { ...buildQuery(), page: pageNum };
      delete (params as any).page;
      const data: PaginatedResponse<User> = await getUsers(params as any);
      setUsers(data.data);
      setPage(data.pagination.page);
      setPages(data.pagination.pages);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleRoleChange = (value: RoleFilter) => {
    setRoleFilter(value);
    setPage(1);
  };

  const handleStaffChange = (value: StaffFilter) => {
    setStaffFilter(value);
    setPage(1);
  };

  const openEdit = async (user: User) => {
    try {
      const detail = await getUser(user.id);
      setEditForm({
        mode: "edit",
        id: detail.data.id,
        full_name: detail.data.full_name,
        phone_number: detail.data.phone_number,
        role: detail.data.role,
        is_active: detail.data.is_active,
        is_staff: detail.data.is_staff,
        is_verified: detail.data.is_verified,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to load user details");
    }
  };

  const closeEdit = () => {
    if (saving) return;
    setEditForm(null);
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!editForm) return;
    const target = e.target;

    if (target.type === "checkbox") {
      const checked = (target as HTMLInputElement).checked;
      setEditForm({ ...editForm, [target.name]: checked });
    } else {
      setEditForm({ ...editForm, [target.name]: target.value });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;

    try {
      setSaving(true);
      const payload: UserUpdateData = {
        full_name: editForm.full_name,
        phone_number: editForm.phone_number,
        role: editForm.role,
        is_active: editForm.is_active,
        is_staff: editForm.is_staff,
        is_verified: editForm.is_verified,
      };

      const response = await updateUser(editForm.id, payload);
      toast.success(response.message || "User updated successfully");
      setEditForm(null);
      void loadUsers();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      const response = await deleteUser(deleteTarget.id);
      toast.success(response.message || "User deleted successfully");
      setDeleteTarget(null);
      void loadUsers();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete user");
    } finally {
      setDeleting(false);
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

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getRoleBadge = (role: string) => {
    const roleStyles: Record<string, string> = {
      teacher: "bg-blue-50 text-blue-700",
      student: "bg-emerald-50 text-emerald-700",
      admin: "bg-purple-50 text-purple-700",
    };

    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
          roleStyles[role] || "bg-gray-100 text-gray-700"
        }`}
      >
        {role}
      </span>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
          isActive
            ? "bg-green-50 text-green-700"
            : "bg-red-50 text-red-700"
        }`}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  const getStaffBadge = (isStaff: boolean) => {
    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
          isStaff
            ? "bg-amber-50 text-amber-700"
            : "bg-slate-100 text-slate-600"
        }`}
      >
        {isStaff ? "Staff" : "Non-staff"}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Users</h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage all platform users
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by email, name, or phone..."
              className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => handleRoleChange(e.target.value as RoleFilter)}
            className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          >
            <option value="all">All Roles</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>

          {/* Staff Filter */}
          <select
            value={staffFilter}
            onChange={(e) => handleStaffChange(e.target.value as StaffFilter)}
            className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          >
            <option value="all">All Staff</option>
            <option value="staff">Staff</option>
            <option value="non-staff">Non-staff</option>
          </select>
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
                  Phone
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Staff
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Joined Date
                </th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <Loader2 className="mx-auto text-slate-400 animate-spin" size={32} />
                    <p className="mt-3 text-sm text-slate-500">Loading users...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <Users className="mx-auto text-slate-300" size={48} />
                    <p className="mt-3 text-sm text-slate-500">
                      No users found matching your criteria.
                    </p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-900">
                        {user.full_name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {user.email}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {user.phone_number}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user.is_active)}
                    </td>
                    <td className="px-6 py-4">
                      {getStaffBadge(user.is_staff)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {formatDate(user.date_joined)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(user)}
                          className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          onClick={() => setDeleteTarget(user)}
                          className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
            <p className="text-sm text-slate-500">
              Showing {total} user{total !== 1 ? "s" : ""}
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
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
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Edit User</h2>
              <button
                onClick={closeEdit}
                disabled={saving}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={editForm.full_name}
                  onChange={handleEditChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone_number"
                  value={editForm.phone_number}
                  onChange={handleEditChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Role
                </label>
                <select
                  name="role"
                  value={editForm.role}
                  onChange={handleEditChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                >
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={editForm.is_active}
                    onChange={handleEditChange}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-600"
                  />
                  <span className="text-sm text-slate-700">Account Active</span>
                </label>

                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="checkbox"
                    name="is_staff"
                    checked={editForm.is_staff}
                    onChange={handleEditChange}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-600"
                  />
                  <span className="text-sm text-slate-700">Staff Member</span>
                </label>

                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="checkbox"
                    name="is_verified"
                    checked={editForm.is_verified}
                    onChange={handleEditChange}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-600"
                  />
                  <span className="text-sm text-slate-700">Verified</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Delete User?
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Are you sure you want to delete{" "}
                <span className="font-medium text-slate-700">
                  {deleteTarget.full_name}
                </span>
                ? This action cannot be undone and will mark the account as inactive.
              </p>
            </div>

            <div className="flex justify-center gap-3 px-6 pb-6">
              <button
                onClick={() => {
                  if (deleting) return;
                  setDeleteTarget(null);
                }}
                disabled={deleting}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
