"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { getCategories, Category, Subcategory } from "@/services/category";
import {
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from "@/services/subcategory";

type FormState = {
  mode: "add" | "edit";
  id?: number;
  category: string;
  name: string;
  description: string;
};

export default function SubcategoriesPage() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [formState, setFormState] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<
    { id: number; name: string } | null
  >(null);
  const [deleting, setDeleting] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch {
      toast.error("Failed to load subcategories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  // Flatten to (category, subcategory) pairs, then filter by search + category
  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();

    return categories
      .filter((c) => categoryFilter === "all" || String(c.id) === categoryFilter)
      .flatMap((category) =>
        category.subcategories
          .filter((sub) => {
            if (!term) return true;
            return (
              sub.name.toLowerCase().includes(term) ||
              category.name.toLowerCase().includes(term) ||
              (sub.description ?? "").toLowerCase().includes(term)
            );
          })
          .map((sub) => ({ category, sub }))
      );
  }, [categories, search, categoryFilter]);

  const totalSubcategories = useMemo(
    () => categories.reduce((sum, c) => sum + c.subcategories.length, 0),
    [categories]
  );

  const openAdd = () => {
    setFormState({
      mode: "add",
      category: categories[0] ? String(categories[0].id) : "",
      name: "",
      description: "",
    });
  };

  const openEdit = (category: Category, sub: Subcategory) => {
    setFormState({
      mode: "edit",
      id: sub.id,
      category: String(category.id),
      name: sub.name,
      description: sub.description ?? "",
    });
  };

  const closeForm = () => {
    if (saving) return;
    setFormState(null);
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    if (!formState) return;
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState) return;

    try {
      setSaving(true);

      const payload = {
        name: formState.name,
        description: formState.description,
        category: Number(formState.category),
      };

      if (formState.mode === "add") {
        const response = await createSubcategory(payload);
        toast.success(response.message || "Subcategory created successfully");
      } else {
        const response = await updateSubcategory(formState.id as number, payload);
        toast.success(response.message || "Subcategory updated successfully");
      }

      setFormState(null);
      void loadCategories();
    } catch (error: unknown) {
      toast.error(
        extractErrorMessage(
          error,
          formState.mode === "add"
            ? "Failed to create subcategory"
            : "Failed to update subcategory"
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);

      const response = await deleteSubcategory(deleteTarget.id);

      toast.success(response.message || "Subcategory deleted successfully");
      setDeleteTarget(null);
      void loadCategories();
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, "Failed to delete subcategory"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Subcategories</h1>
          <p className="text-gray-500 mt-2">
            {loading
              ? "Loading subcategories..."
              : `${totalSubcategories} subcategor${
                  totalSubcategories === 1 ? "y" : "ies"
                } across ${categories.length} categor${
                  categories.length === 1 ? "y" : "ies"
                }`}
          </p>
        </div>

        <button
          onClick={openAdd}
          disabled={loading || categories.length === 0}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 whitespace-nowrap disabled:opacity-60"
        >
          + Add Sub Category
        </button>
      </div>

      {/* Search + filter */}
      <div className="bg-white rounded-3xl p-4 shadow-sm mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35m1.35-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by subcategory, category, or description"
            className="w-full border rounded-xl pl-11 pr-4 py-3"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border rounded-xl px-4 py-3 sm:w-56"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">
            Loading subcategories...
          </div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-500">
              {search || categoryFilter !== "all"
                ? "No subcategories match your search."
                : "No subcategories yet."}
            </p>
            {!search && categoryFilter === "all" && categories.length > 0 && (
              <button
                onClick={openAdd}
                className="inline-block mt-4 text-blue-600 hover:underline"
              >
                Create your first subcategory
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y">
            {rows.map(({ category, sub }) => (
              <li
                key={sub.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 hover:bg-gray-50"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{sub.name}</span>
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                      {category.name}
                    </span>
                  </div>
                  {sub.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {sub.description}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => openEdit(category, sub)}
                    className="px-4 py-2 rounded-xl border text-sm hover:bg-gray-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      setDeleteTarget({ id: sub.id, name: sub.name })
                    }
                    className="px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add / Edit modal (shared) */}
      {formState && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-xl">
            <h2 className="text-xl font-bold mb-6">
              {formState.mode === "add" ? "Add Sub Category" : "Edit Sub Category"}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div>
                <label className="block mb-2 font-medium">Category</label>
                <select
                  name="category"
                  value={formState.category}
                  onChange={handleFormChange}
                  className="w-full border rounded-xl px-4 py-3"
                  required
                >
                  <option value="" disabled>
                    Select Category
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Sub Category Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formState.name}
                  onChange={handleFormChange}
                  placeholder="Humanities"
                  className="w-full border rounded-xl px-4 py-3"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Description</label>
                <textarea
                  name="description"
                  rows={4}
                  value={formState.description}
                  onChange={handleFormChange}
                  className="w-full border rounded-xl px-4 py-3"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="px-6 py-3 rounded-xl border hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : formState.mode === "add"
                    ? "Save Sub Category"
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-xl text-center">
            <h2 className="text-xl font-bold mb-2">Delete subcategory?</h2>
            <p className="text-gray-500 mb-6">
              This will permanently remove{" "}
              <span className="font-medium text-gray-700">
                &ldquo;{deleteTarget.name}&rdquo;
              </span>
              . This action cannot be undone.
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-6 py-3 rounded-xl border hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 disabled:opacity-60"
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

function extractErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const err = error as {
      response?: { data?: Record<string, string[] | string> };
    };

    const data = err.response?.data;

    const nonField = data?.non_field_errors;
    if (Array.isArray(nonField) && nonField[0]) return nonField[0];

    const categoryErr = data?.category;
    if (Array.isArray(categoryErr) && categoryErr[0]) return categoryErr[0];

    const nameErr = data?.name;
    if (Array.isArray(nameErr) && nameErr[0]) return nameErr[0];

    if (typeof data?.message === "string") return data.message;
  }

  return fallback;
}