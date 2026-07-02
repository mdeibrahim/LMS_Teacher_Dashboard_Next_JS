"use client";

import {
  FolderTree,
  GraduationCap,
  Layers3,
  Search,
  X,
} from "lucide-react";

import type { Category } from "@/services/category";
import type { Course } from "@/services/courses";

interface QuizFiltersProps {
  categories: Category[];
  subCategories: Category["subcategories"];
  courses: Course[];

  selectedCategory?: number;
  selectedSubCategory?: number;
  selectedCourse?: number;

  onCategoryChange: (id?: number) => void;
  onSubCategoryChange: (id?: number) => void;
  onCourseChange: (id?: number) => void;
}

export default function QuizFilters({
  categories,
  subCategories,
  courses,
  selectedCategory,
  selectedSubCategory,
  selectedCourse,
  onCategoryChange,
  onSubCategoryChange,
  onCourseChange,
}: QuizFiltersProps) {
  const clearFilters = () => {
    onCategoryChange(undefined);
    onSubCategoryChange(undefined);
    onCourseChange(undefined);
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="text-blue-600" size={18} />

          <h2 className="text-lg font-semibold text-slate-800">
            Filter Quizzes
          </h2>
        </div>

        <button
          type="button"
          onClick={clearFilters}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
        >
          <X size={16} />

          Clear
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
            <FolderTree size={16} />

            Category
          </label>

          <select
            value={selectedCategory ?? ""}
            onChange={(event) =>
              onCategoryChange(
                event.target.value ? Number(event.target.value) : undefined
              )
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-600"
          >
            <option value="">Select Category</option>

            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
            <Layers3 size={16} />

            Sub Category
          </label>

          <select
            value={selectedSubCategory ?? ""}
            disabled={!selectedCategory}
            onChange={(event) =>
              onSubCategoryChange(
                event.target.value ? Number(event.target.value) : undefined
              )
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-600 disabled:bg-slate-100"
          >
            <option value="">Select Sub Category</option>

            {subCategories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
            <GraduationCap size={16} />

            Course
          </label>

          <select
            value={selectedCourse ?? ""}
            disabled={!selectedSubCategory}
            onChange={(event) =>
              onCourseChange(
                event.target.value ? Number(event.target.value) : undefined
              )
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-600 disabled:bg-slate-100"
          >
            <option value="">Select Course</option>

            {courses.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}