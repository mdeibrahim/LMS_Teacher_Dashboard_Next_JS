"use client";

import {
  ChevronDown,
  FolderTree,
  Layers,
  Search,
  Tag,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Category, getCategories } from "@/services/category";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  const toggleCollapsed = (id: number) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const totalSubcategories = useMemo(
    () => categories.reduce((sum, c) => sum + c.subcategories.length, 0),
    [categories]
  );

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return categories;

    return categories
      .map((category) => {
        const categoryMatches = category.name.toLowerCase().includes(term);
        const matchingSubs = category.subcategories.filter((sub) =>
          sub.name.toLowerCase().includes(term)
        );

        if (categoryMatches) return category;
        if (matchingSubs.length > 0) {
          return { ...category, subcategories: matchingSubs };
        }
        return null;
      })
      .filter((c): c is Category => c !== null);
  }, [categories, search]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-gray-500 mt-2">
            Browse all categories and subcategories.
          </p>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl shadow-sm p-6 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-slate-100" />
                <div className="h-5 w-40 rounded bg-slate-100" />
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {[1, 2, 3].map((j) => (
                  <div
                    key={j}
                    className="h-11 rounded-xl bg-slate-50"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-gray-500 mt-2">
            {categories.length > 0
              ? `${categories.length} categor${
                  categories.length === 1 ? "y" : "ies"
                } · ${totalSubcategories} subcategor${
                  totalSubcategories === 1 ? "y" : "ies"
                }`
              : "Browse all categories and subcategories."}
          </p>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <FolderTree className="mx-auto text-slate-300" size={40} />
          <p className="mt-4 text-base font-medium text-slate-700">
            No categories assigned by Admin yet.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Categories will appear here once they are created and assigned.
          </p>
        </div>
      ) : (
        <>
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories or subcategories"
              className="w-full rounded-2xl border bg-white pl-11 pr-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
          </div>

          {filteredCategories.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
              <p className="text-sm text-slate-500">
                No categories or subcategories match &ldquo;{search}&rdquo;.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCategories.map((category) => {
                const isCollapsed = collapsed.has(category.id);

                return (
                  <div
                    key={category.id}
                    className="bg-white rounded-3xl shadow-sm overflow-hidden"
                  >
                    <button
                      onClick={() => toggleCollapsed(category.id)}
                      className="w-full flex items-center justify-between gap-3 p-6 text-left hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                          <FolderTree className="text-blue-600" size={20} />
                        </span>

                        <div className="min-w-0">
                          <h2 className="text-xl font-bold truncate">
                            {category.name}
                          </h2>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          <Layers size={13} />
                          {category.subcategories.length}
                        </span>

                        <ChevronDown
                          size={18}
                          className={`text-slate-400 transition-transform ${
                            isCollapsed ? "" : "rotate-180"
                          }`}
                        />
                      </div>
                    </button>

                    {!isCollapsed && (
                      <div className="px-6 pb-6">
                        {category.subcategories.length > 0 ? (
                          <div className="grid gap-3 md:grid-cols-3">
                            {category.subcategories.map((subcategory) => (
                              <div
                                key={subcategory.id}
                                className="group flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 transition-colors hover:bg-blue-50"
                              >
                                <Tag
                                  size={15}
                                  className="text-slate-400 group-hover:text-blue-500 shrink-0"
                                />
                                <span className="truncate text-sm font-medium text-slate-700">
                                  {subcategory.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">
                            No subcategories available.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}