"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { startTransition, useEffect, useState } from "react";

import { getCategories, type Category } from "@/services/category";

import { getCourses, type Course } from "@/services/courses";
import { deleteQuiz, getQuizzes, type Quiz } from "@/services/quiz";

import QuizFilters from "@/components/quiz/QuizFilters";
import QuizTable from "@/components/quiz/QuizTable";

export default function QuizzesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<number>();
  const [selectedSubCategory, setSelectedSubCategory] = useState<number>();
  const [selectedCourse, setSelectedCourse] = useState<number>();

  const [loading, setLoading] = useState(false);
  const selectedCategoryData = categories.find(
    (category) => category.id === selectedCategory
  );
  const subCategories = selectedCategoryData?.subcategories ?? [];

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const data = await getCategories();

        if (cancelled) return;

        startTransition(() => {
          setCategories(data);
        });
      } catch (error) {
        console.error(error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        setLoading(true);

        const data = await getQuizzes({
          category: selectedCategory,
          sub_category: selectedSubCategory,
          course: selectedCourse,
        });

        if (cancelled) return;

        startTransition(() => {
          setQuizzes(data);
          setLoading(false);
        });
      } catch (error) {
        if (!cancelled) {
          console.error(error);

          startTransition(() => {
            setLoading(false);
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    selectedCategory,
    selectedSubCategory,
    selectedCourse,
  ]);

  async function loadCourses() {
    try {
      const data = await getCourses();

      setCourses(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchQuizzes() {
    try {
      setLoading(true);

      const data = await getQuizzes({
        category: selectedCategory,
        sub_category: selectedSubCategory,
        course: selectedCourse,
      });

      startTransition(() => {
        setQuizzes(data);
        setLoading(false);
      });
    } catch (error) {
      console.error(error);

      startTransition(() => {
        setLoading(false);
      });
    }
  }

  function handleCategoryChange(categoryId?: number) {
    setSelectedCategory(categoryId);
    setSelectedSubCategory(undefined);
    setSelectedCourse(undefined);
    setCourses([]);
  }

  function handleSubCategoryChange(subCategoryId?: number) {
    setSelectedSubCategory(subCategoryId);
    setSelectedCourse(undefined);

    if (subCategoryId) {
      void loadCourses();
      return;
    }

    setCourses([]);
  }

  function handleCourseChange(courseId?: number) {
    setSelectedCourse(courseId);
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Delete this quiz?"
    );

    if (!confirmed) return;

    try {
      await deleteQuiz(id);

      void fetchQuizzes();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            Quizzes
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage quizzes by category,
            sub category and course.
          </p>

        </div>

        <Link
          href="/manage-content/quizzes/add-quiz"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />

          Add Quiz
        </Link>

      </div>

      {/* Filters */}

      <QuizFilters
        categories={categories}
        subCategories={subCategories}
        courses={courses}
        selectedCategory={selectedCategory}
        selectedSubCategory={selectedSubCategory}
        selectedCourse={selectedCourse}
        onCategoryChange={handleCategoryChange}
        onSubCategoryChange={handleSubCategoryChange}
        onCourseChange={handleCourseChange}
      />

      {/* Table */}

      <QuizTable
        quizzes={quizzes}
        loading={loading}
        onDelete={handleDelete}
      />

    </div>
  );
}