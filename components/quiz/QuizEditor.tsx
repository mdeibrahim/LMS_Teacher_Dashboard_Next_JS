"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BookOpen, Layers, Pencil, Save } from "lucide-react";

import { getCategories, type Category } from "@/services/category";
import { getCourses, type Course } from "@/services/courses";
import { getModules, type Module } from "@/services/module";
import { getLessons, type Lesson } from "@/services/lesson";
import {
  createQuiz,
  getQuiz,
  updateQuiz,
  type Quiz,
  type QuizQuestion,
} from "@/services/quiz";

import SaveStatus from "@/components/lesson-editor/SaveStatus";
import QuizInfoCard, { type QuizAttachTarget } from "./QuizInfoCard";
import QuestionList from "./QuestionList";

type SaveTone = "idle" | "dirty" | "saving" | "success" | "error";

interface QuizEditorProps {
  initialQuizId?: number;
}

function isValidId(value?: number | null) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export default function QuizEditor({ initialQuizId }: QuizEditorProps) {
  const router = useRouter();
  const isEditingQuiz = isValidId(initialQuizId);

  const [loading, setLoading] = useState(isEditingQuiz);
  const [saving, setSaving] = useState(false);
  const [statusTone, setStatusTone] = useState<SaveTone>("idle");
  const [statusMessage, setStatusMessage] = useState("Ready to draft");

  // Existing quiz snapshot (edit mode) — used as a fallback when the teacher
  // hasn't chosen to reassign the quiz to a different lesson/module.
  const [originalQuiz, setOriginalQuiz] = useState<Quiz | null>(null);
  const [isReassigning, setIsReassigning] = useState(!isEditingQuiz);

  // Quiz fields
  const [title, setTitle] = useState("");
  const [passScore, setPassScore] = useState(50);
  const [order, setOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  // Attachment chain
  const [attachTo, setAttachTo] = useState<QuizAttachTarget>("lesson");
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [lessonsLoading, setLessonsLoading] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<number>();
  const [selectedSubCategory, setSelectedSubCategory] = useState<number>();
  const [selectedCourse, setSelectedCourse] = useState<number>();
  const [selectedModule, setSelectedModule] = useState<number>();
  const [selectedLesson, setSelectedLesson] = useState<number>();

  const selectedCategoryData = categories.find(
    (c) => c.id === selectedCategory
  );
  const subCategories = selectedCategoryData?.subcategories ?? [];

  const markDirty = () => {
    setStatusTone("dirty");
    setStatusMessage("Unsaved changes");
  };

  // Load categories once
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories", error);
      }
    };
    void load();
  }, []);

  // Load courses whenever a subcategory is chosen (mirrors the lessons flow)
  useEffect(() => {
    if (!selectedSubCategory) {
      setCourses([]);
      return;
    }

    const load = async () => {
      try {
        const data = await getCourses();
        setCourses(data);
      } catch (error) {
        console.error("Failed to load courses", error);
      }
    };
    void load();
  }, [selectedSubCategory]);

  // Load modules whenever a course is chosen
  useEffect(() => {
    if (!selectedCourse) {
      setModules([]);
      return;
    }

    const load = async () => {
      try {
        setModulesLoading(true);
        const data = await getModules(selectedCourse);
        setModules(data);
      } catch (error) {
        console.error("Failed to load modules", error);
      } finally {
        setModulesLoading(false);
      }
    };
    void load();
  }, [selectedCourse]);

  // Load lessons whenever a module is chosen (only needed for lesson-level quizzes)
  useEffect(() => {
    if (attachTo !== "lesson" || !selectedModule) {
      setLessons([]);
      return;
    }

    const load = async () => {
      try {
        setLessonsLoading(true);
        const data = await getLessons(selectedModule);
        setLessons(data);
      } catch (error) {
        console.error("Failed to load lessons", error);
      } finally {
        setLessonsLoading(false);
      }
    };
    void load();
  }, [attachTo, selectedModule]);

  // Load the existing quiz when editing
  useEffect(() => {
    if (!isEditingQuiz) return;

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const quiz = await getQuiz(initialQuizId as number);
        if (cancelled) return;

        setOriginalQuiz(quiz);
        setTitle(quiz.title);
        setPassScore(quiz.pass_score);
        setOrder(quiz.order);
        setIsActive(quiz.is_active);
        setQuestions(quiz.questions ?? []);
        setAttachTo(quiz.lesson ? "lesson" : "module");
        setStatusTone("idle");
        setStatusMessage("Quiz loaded");
      } catch (error) {
        console.error("Failed to load quiz", error);
        toast.error("Failed to load quiz");
        setStatusTone("error");
        setStatusMessage("Unable to load quiz");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [initialQuizId, isEditingQuiz]);

  const handleCategoryChange = (id?: number) => {
    setSelectedCategory(id);
    setSelectedSubCategory(undefined);
    setSelectedCourse(undefined);
    setSelectedModule(undefined);
    setSelectedLesson(undefined);
    setCourses([]);
    setModules([]);
    setLessons([]);
    markDirty();
  };

  const handleSubCategoryChange = (id?: number) => {
    setSelectedSubCategory(id);
    setSelectedCourse(undefined);
    setSelectedModule(undefined);
    setSelectedLesson(undefined);
    setModules([]);
    setLessons([]);
    markDirty();
  };

  const handleCourseChange = (id?: number) => {
    setSelectedCourse(id);
    setSelectedModule(undefined);
    setSelectedLesson(undefined);
    setLessons([]);
    markDirty();
  };

  const handleModuleChange = (id?: number) => {
    setSelectedModule(id);
    setSelectedLesson(undefined);
    markDirty();
  };

  const handleLessonChange = (id?: number) => {
    setSelectedLesson(id);
    markDirty();
  };

  const handleAttachToChange = (value: QuizAttachTarget) => {
    setAttachTo(value);
    setSelectedLesson(undefined);
    markDirty();
  };

  const effectiveModuleId = isReassigning
    ? selectedModule
    : originalQuiz?.module ?? selectedModule;

  const effectiveLessonId = isReassigning
    ? selectedLesson
    : originalQuiz?.lesson ?? selectedLesson;

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Quiz title is required");
      return;
    }

    if (attachTo === "lesson" && !isValidId(effectiveLessonId)) {
      toast.error("Please select a lesson for this quiz");
      return;
    }

    if (attachTo === "module" && !isValidId(effectiveModuleId)) {
      toast.error("Please select a module for this quiz");
      return;
    }

    try {
      setSaving(true);
      setStatusTone("saving");
      setStatusMessage("Saving quiz...");

      const payload = {
        title: title.trim(),
        pass_score: passScore,
        order,
        is_active: isActive,
        module: attachTo === "module" ? effectiveModuleId ?? null : null,
        lesson: attachTo === "lesson" ? effectiveLessonId ?? null : null,
        questions,
      };

      if (isEditingQuiz) {
        await updateQuiz(initialQuizId as number, payload);
        toast.success("Quiz updated successfully");
      } else {
        await createQuiz(payload);
        toast.success("Quiz created successfully");
      }

      setStatusTone("success");
      setStatusMessage("Quiz saved");

      setTimeout(() => {
        router.push("/manage-content/quizzes");
      }, 700);
    } catch (error: unknown) {
      console.error("Failed to save quiz", error);
      setStatusTone("error");
      setStatusMessage("Failed to save quiz");
      toast.error(
        isEditingQuiz ? "Failed to update quiz" : "Failed to create quiz"
      );
    } finally {
      setSaving(false);
    }
  };

  const attachmentSummary = useMemo(() => {
    if (!originalQuiz) return null;
    if (originalQuiz.lesson) {
      return {
        icon: BookOpen,
        label: originalQuiz.lesson_title ?? `Lesson #${originalQuiz.lesson}`,
        context: originalQuiz.course_title,
      };
    }
    if (originalQuiz.module) {
      return {
        icon: Layers,
        label: originalQuiz.module_title ?? `Module #${originalQuiz.module}`,
        context: originalQuiz.course_title,
      };
    }
    return null;
  }, [originalQuiz]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
        Loading quiz...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SaveStatus tone={statusTone} message={statusMessage} />
      </div>

      {isEditingQuiz && !isReassigning && attachmentSummary && (
        <div className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <attachmentSummary.icon size={18} />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Attached to
              </p>
              <p className="font-medium text-slate-800">
                {attachmentSummary.label}
              </p>
              {attachmentSummary.context && (
                <p className="text-xs text-slate-500">
                  {attachmentSummary.context}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsReassigning(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <Pencil size={14} />
            Change
          </button>
        </div>
      )}

      <QuizInfoCard
        title={title}
        onTitleChange={(value) => {
          setTitle(value);
          markDirty();
        }}
        passScore={passScore}
        onPassScoreChange={(value) => {
          setPassScore(value);
          markDirty();
        }}
        order={order}
        onOrderChange={(value) => {
          setOrder(value);
          markDirty();
        }}
        isActive={isActive}
        onIsActiveChange={(value) => {
          setIsActive(value);
          markDirty();
        }}
        attachTo={attachTo}
        onAttachToChange={handleAttachToChange}
        categories={categories}
        subCategories={subCategories}
        courses={courses}
        modules={modules}
        lessons={lessons}
        selectedCategory={selectedCategory}
        selectedSubCategory={selectedSubCategory}
        selectedCourse={selectedCourse}
        selectedModule={selectedModule}
        selectedLesson={selectedLesson}
        onCategoryChange={handleCategoryChange}
        onSubCategoryChange={handleSubCategoryChange}
        onCourseChange={handleCourseChange}
        onModuleChange={handleModuleChange}
        onLessonChange={handleLessonChange}
        modulesLoading={modulesLoading}
        lessonsLoading={lessonsLoading}
        showAttachmentPicker={isReassigning || !attachmentSummary}
      />

      <QuestionList questions={questions} setQuestions={setQuestions} />

      <div className="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/manage-content/quizzes")}
          className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={14} />
          {saving
            ? "Saving..."
            : isEditingQuiz
              ? "Update Quiz"
              : "Save Quiz"}
        </button>
      </div>
    </div>
  );
}