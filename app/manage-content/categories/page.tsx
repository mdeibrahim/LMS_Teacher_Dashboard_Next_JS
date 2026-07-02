"use client";

import {
  ChevronRight,
  FolderTree,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  Category,
  getCategories,
} from "@/services/category";

export default function CategoriesPage() {
  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data =
          await getCategories();

        setCategories(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        Loading categories...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Categories
        </h1>

        <p className="text-gray-500 mt-2">
          Browse all categories and
          subcategories.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
          <p className="text-base font-medium text-slate-700">
            No categories assigned by Admin yet.
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Categories will appear here once they are created and assigned.
          </p>
        </div>
      ) : (
        categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-3xl shadow-sm p-6"
          >
            <div className="flex items-center gap-3">
              <FolderTree
                className="text-blue-600"
                size={24}
              />

              <h2 className="text-xl font-bold">
                {category.name}
              </h2>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {category.subcategories.length > 0 ? (
                category.subcategories.map((subcategory) => (
                  <div
                    key={subcategory.id}
                    className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3"
                  >
                    <ChevronRight size={16} />

                    <span>{subcategory.name}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No subcategories available.
                </p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}