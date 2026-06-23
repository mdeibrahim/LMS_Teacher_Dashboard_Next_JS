"use client";

import { useEffect, useState } from "react";
import {
  FolderTree,
  ChevronRight,
} from "lucide-react";

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

      {categories.map((category) => (
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

          <div className="mt-5 grid md:grid-cols-3 gap-3">
            {category.subcategories.map(
              (subcategory) => (
                <div
                  key={subcategory.id}
                  className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-3"
                >
                  <ChevronRight
                    size={16}
                  />

                  <span>
                    {subcategory.name}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}