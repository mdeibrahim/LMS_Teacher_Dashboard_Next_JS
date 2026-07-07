"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { startTransition, useEffect, useState } from "react";

import { getCategories, type Category } from "@/services/category";
import { getCourses, type Course } from "@/services/courses";
import { deleteQuiz, getQuizzes, type Quiz } from "@/services/quiz";

import QuizFilters from "@/components/quiz/QuizFilters";
import QuizTable from "@/components/quiz/QuizTable";
import QuizDeleteModal from "@/components/quiz/DeleteQuizModal";
import { toast } from "sonner";

export default function QuizzesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<number>();
  const [selectedSubCategory, setSelectedSubCategory] = useState<number>();
  const [selectedCourse, setSelectedCourse] = useState<number>();

  const [loading, setLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Quiz | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  // Courses only need to be loaded once a subcategory is picked (mirrors
  // the lessons page's filter flow).
  useEffect(() => {
    let cancelled = false;

    if (!selectedSubCategory) {
      setCourses([]);
      return;
    }

    void (async () => {
      try {
        const data = await getCourses();
        if (cancelled) return;
        setCourses(data);
      } catch (error) {
        console.error(error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedSubCategory]);

  async function fetchQuizzes() {
    try {
      setLoading(true);

      // The backend only filters by course_id/module_id/lesson_id, so
      // category/sub-category only narrow which course the teacher can pick.
      const data = await getQuizzes({
        course_id: selectedCourse,
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

  useEffect(() => {
    void fetchQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourse]);

  function handleCategoryChange(categoryId?: number) {
    setSelectedCategory(categoryId);
    setSelectedSubCategory(undefined);
    setSelectedCourse(undefined);
    setCourses([]);
  }

  function handleSubCategoryChange(subCategoryId?: number) {
    setSelectedSubCategory(subCategoryId);
    setSelectedCourse(undefined);
    if (!subCategoryId) {
      setCourses([]);
    }
  }

  function handleCourseChange(courseId?: number) {
    setSelectedCourse(courseId);
  }

  function handleDeleteRequest(quiz: Quiz) {
    setDeleteTarget(quiz);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      await deleteQuiz(deleteTarget.id);
      toast.success(`"${deleteTarget.title}" deleted successfully`);
      setDeleteTarget(null);
      void fetchQuizzes();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete quiz");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quizzes</h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage quizzes by category, sub category and course.
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
        onDelete={handleDeleteRequest}
      />

      <QuizDeleteModal
        open={deleteTarget !== null}
        quizTitle={deleteTarget?.title}
        deleting={deleting}
        onCancel={() => {
          if (deleting) return;
          setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}