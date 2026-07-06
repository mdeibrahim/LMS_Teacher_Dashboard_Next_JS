"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { getCategories, type Category } from "@/services/category";
import { getCourses, type Course } from "@/services/courses";
import { getModules, type Module } from "@/services/module";
import {
  deleteLesson,
  getAllLessons,
  getLessons,
  type Lesson,
} from "@/services/lesson";

import LessonFilters from "@/components/lesson/LessonFilters";
import LessonTable from "@/components/lesson/LessonTable";

export default function LessonsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<number>();
  const [selectedSubCategory, setSelectedSubCategory] = useState<number>();
  const [selectedCourse, setSelectedCourse] = useState<number>();
  const [selectedModule, setSelectedModule] = useState<number>();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [lessonIdToDelete, setLessonIdToDelete] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedCategoryData = categories.find(
    (category) => category.id === selectedCategory
  );

  useEffect(() => {
    loadCategories();
    loadAllLessons();
  }, []);

  useEffect(() => {
    if (!selectedSubCategory) return;
    loadCourses();
  }, [selectedSubCategory]);

  useEffect(() => {
    if (!selectedCourse) return;
    loadModules(selectedCourse);
  }, [selectedCourse]);

  useEffect(() => {
    if (!selectedModule) return;
    loadLessons(selectedModule);
  }, [selectedModule]);

  async function loadCategories() {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadCourses() {
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadModules(courseId: number) {
    try {
      const data = await getModules(courseId);
      setModules(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadLessons(moduleId: number) {
    try {
      setLoading(true);
      const data = await getLessons(moduleId);
      setLessons(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadAllLessons() {
    try {
      setLoading(true);
      const data = await getAllLessons();
      setLessons(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleCategoryChange(categoryId?: number) {
    setSelectedCategory(categoryId);
    setSelectedSubCategory(undefined);
    setSelectedCourse(undefined);
    setSelectedModule(undefined);
    setCourses([]);
    setModules([]);
    setLessons([]);
  }

  function handleSubCategoryChange(subCategoryId?: number) {
    setSelectedSubCategory(subCategoryId);
    setSelectedCourse(undefined);
    setSelectedModule(undefined);
    setCourses([]);
    setModules([]);
    setLessons([]);
  }

  function handleCourseChange(courseId?: number) {
    setSelectedCourse(courseId);
    setSelectedModule(undefined);
    setModules([]);
    setLessons([]);
  }

  function handleModuleChange(moduleId?: number) {
    setSelectedModule(moduleId);
    setLessons([]);
  }

  function handleDelete(lessonId: number) {
    setLessonIdToDelete(lessonId);
    setIsDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (lessonIdToDelete === null) return;

    try {
      await toast.promise(deleteLesson(lessonIdToDelete), {
        loading: "Deleting lesson...",
        success: async () => {
          if (selectedModule) {
            await loadLessons(selectedModule);
          } else {
            await loadAllLessons();
          }
          return "Lesson deleted successfully.";
        },
        error: (error) =>
          error?.response?.data?.message ?? "Failed to delete lesson.",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleteModalOpen(false);
      setLessonIdToDelete(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lessons</h1>
          <p className="mt-2 text-slate-500">
            Manage lessons by category, course and module.
          </p>
        </div>

        <Link
          href="/manage-content/lessons/add-lesson"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Lesson
        </Link>
      </div>

      <LessonFilters
        categories={categories}
        subcategories={selectedCategoryData?.subcategories ?? []}
        courses={courses}
        modules={modules}
        selectedCategory={selectedCategory}
        selectedSubCategory={selectedSubCategory}
        selectedCourse={selectedCourse}
        selectedModule={selectedModule}
        onCategoryChange={handleCategoryChange}
        onSubCategoryChange={handleSubCategoryChange}
        onCourseChange={handleCourseChange}
        onModuleChange={handleModuleChange}
      />

      <LessonTable
        lessons={lessons}
        loading={loading}
        courseId={selectedCourse}
        moduleId={selectedModule}
        onDelete={handleDelete}
      />

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="w-96 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold">Confirm Deletion</h2>
            <p className="mb-6">
              Are you sure you want to delete this lesson? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="rounded px-4 py-2 bg-gray-200 transition hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setLessonIdToDelete(null);
                }}
              >
                Cancel
              </button>
              <button
                className="rounded px-4 py-2 bg-red-600 text-white transition hover:bg-red-700"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}