"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import {
  getCategories,
  type Category,
} from "@/services/category";
import { getCourses, type Course } from "@/services/courses";
import { getModules, type Module } from "@/services/module";
import {
  deleteLesson,
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

  const [selectedCategory, setSelectedCategory] =
    useState<number>();

  const [selectedSubCategory, setSelectedSubCategory] =
    useState<number>();

  const [selectedCourse, setSelectedCourse] =
    useState<number>();

  const [selectedModule, setSelectedModule] =
    useState<number>();

  const [loading, setLoading] = useState(false);
  const selectedCategoryData = categories.find(
    (category) => category.id === selectedCategory
  );

  useEffect(() => {
    loadCategories();
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

  async function handleDelete(id: number) {
    if (!selectedModule) return;

    const ok = window.confirm(
      "Delete this lesson?"
    );

    if (!ok) return;

    await deleteLesson(selectedModule, id);

    loadLessons(selectedModule);
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            Lessons
          </h1>

          <p className="text-slate-500 mt-2">
            Manage lessons by category,
            course and module.
          </p>

        </div>

        <Link
          href="/manage-content/lessons/add-lesson"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700 transition"
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
        moduleId={selectedModule}
        onDelete={handleDelete}
      />

    </div>
  );
}
