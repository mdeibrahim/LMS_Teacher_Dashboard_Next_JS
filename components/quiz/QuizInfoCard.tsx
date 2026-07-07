"use client";

import { BookOpen, FolderTree, GraduationCap, Layers } from "lucide-react";

import type { Category, Subcategory } from "@/services/category";
import type { Course } from "@/services/courses";
import type { Module } from "@/services/module";
import type { Lesson } from "@/services/lesson";

export type QuizAttachTarget = "lesson" | "module";

interface QuizInfoCardProps {
  title: string;
  onTitleChange: (value: string) => void;
  passScore: number;
  onPassScoreChange: (value: number) => void;
  order: number;
  onOrderChange: (value: number) => void;
  isActive: boolean;
  onIsActiveChange: (value: boolean) => void;

  attachTo: QuizAttachTarget;
  onAttachToChange: (value: QuizAttachTarget) => void;

  categories: Category[];
  subCategories: Subcategory[];
  courses: Course[];
  modules: Module[];
  lessons: Lesson[];

  selectedCategory?: number;
  selectedSubCategory?: number;
  selectedCourse?: number;
  selectedModule?: number;
  selectedLesson?: number;

  onCategoryChange: (id?: number) => void;
  onSubCategoryChange: (id?: number) => void;
  onCourseChange: (id?: number) => void;
  onModuleChange: (id?: number) => void;
  onLessonChange: (id?: number) => void;

  modulesLoading?: boolean;
  lessonsLoading?: boolean;
  showAttachmentPicker?: boolean;
}

export default function QuizInfoCard({
  title,
  onTitleChange,
  passScore,
  onPassScoreChange,
  order,
  onOrderChange,
  isActive,
  onIsActiveChange,

  attachTo,
  onAttachToChange,

  categories,
  subCategories,
  courses,
  modules,
  lessons,

  selectedCategory,
  selectedSubCategory,
  selectedCourse,
  selectedModule,
  selectedLesson,

  onCategoryChange,
  onSubCategoryChange,
  onCourseChange,
  onModuleChange,
  onLessonChange,

  modulesLoading = false,
  lessonsLoading = false,
  showAttachmentPicker = true,
}: QuizInfoCardProps) {
  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Title / order / pass score */}
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_140px_140px]">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Quiz Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="e.g. Chapter 1 Recap Quiz"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Pass Score (%)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={passScore}
            onChange={(event) => onPassScoreChange(Number(event.target.value))}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Order
          </label>
          <input
            type="number"
            min={1}
            value={order}
            onChange={(event) => onOrderChange(Number(event.target.value))}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(event) => onIsActiveChange(event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        Quiz is active
      </label>

      {showAttachmentPicker && (
        <>
          <div className="h-px bg-slate-100" />

          {/* Attach target */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Attach Quiz To
            </label>
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => onAttachToChange("lesson")}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  attachTo === "lesson"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <BookOpen size={15} />
                Specific Lesson
              </button>
              <button
                type="button"
                onClick={() => onAttachToChange("module")}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  attachTo === "module"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Layers size={15} />
                Whole Module
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {attachTo === "lesson"
                ? "This quiz will appear at the end of the selected lesson."
                : "This quiz will appear as a module-level checkpoint, not tied to one lesson."}
            </p>
          </div>

          {/* Category -> Subcategory -> Course -> Module -> (Lesson) */}
          <div className="grid gap-5 lg:grid-cols-4 md:grid-cols-2">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                <FolderTree size={16} />
                Category
              </label>
              <select
                value={selectedCategory ?? ""}
                onChange={(e) =>
                  onCategoryChange(e.target.value ? Number(e.target.value) : undefined)
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

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                <FolderTree size={16} />
                Sub Category
              </label>
              <select
                value={selectedSubCategory ?? ""}
                disabled={!selectedCategory}
                onChange={(e) =>
                  onSubCategoryChange(e.target.value ? Number(e.target.value) : undefined)
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

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                <GraduationCap size={16} />
                Course
              </label>
              <select
                value={selectedCourse ?? ""}
                disabled={!selectedSubCategory}
                onChange={(e) =>
                  onCourseChange(e.target.value ? Number(e.target.value) : undefined)
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

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                <Layers size={16} />
                Module
              </label>
              <select
                value={selectedModule ?? ""}
                disabled={!selectedCourse}
                onChange={(e) =>
                  onModuleChange(e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 disabled:bg-slate-100"
              >
                <option value="">
                  {modulesLoading ? "Loading modules..." : "Select Module"}
                </option>
                {modules.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>

            {attachTo === "lesson" && (
              <div className="lg:col-span-4 md:col-span-2">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                  <BookOpen size={16} />
                  Lesson
                </label>
                <select
                  value={selectedLesson ?? ""}
                  disabled={!selectedModule}
                  onChange={(e) =>
                    onLessonChange(e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 disabled:bg-slate-100 lg:max-w-md"
                >
                  <option value="">
                    {lessonsLoading ? "Loading lessons..." : "Select Lesson"}
                  </option>
                  {lessons.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}