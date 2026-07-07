"use client";

import { FolderTree, GraduationCap, Search } from "lucide-react";

import { type Category, type Subcategory } from "@/services/category";
import type { Course } from "@/services/courses";

interface Props {
  categories: Category[];
  subCategories: Subcategory[];
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
}: Props) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <Search className="text-blue-600" size={18} />
        <h2 className="text-lg font-semibold text-slate-800">
          Filter Quizzes
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {/* Category */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
            <FolderTree size={16} />
            Category
          </label>

          <select
            value={selectedCategory ?? ""}
            onChange={(e) =>
              onCategoryChange(
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500"
          >
            <option value="">Select Category</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sub Category */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
            <FolderTree size={16} />
            Sub Category
          </label>

          <select
            value={selectedSubCategory ?? ""}
            disabled={!selectedCategory}
            onChange={(e) =>
              onSubCategoryChange(
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 disabled:bg-slate-100"
          >
            <option value="">Select Sub Category</option>
            {subCategories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* Course */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
            <GraduationCap size={16} />
            Course
          </label>

          <select
            value={selectedCourse ?? ""}
            disabled={!selectedSubCategory}
            onChange={(e) =>
              onCourseChange(
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 disabled:bg-slate-100"
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