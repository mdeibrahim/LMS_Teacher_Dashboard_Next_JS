"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getCourses, type Course } from "@/services/courses";
import {
  getModule,
  getModules,
  updateModule,
  type ModuleFormData,
} from "@/services/module";

type ModuleEditFormProps = {
  moduleId: number;
  courseId?: number;
};

export default function ModuleEditForm({
  moduleId,
  courseId: initialCourseId,
}: ModuleEditFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [resolvedCourseId, setResolvedCourseId] = useState<
    number | null
  >(initialCourseId ?? null);
  const [formData, setFormData] = useState<ModuleFormData>({
    title: "",
    description: "",
    order: 1,
    is_published: false,
  });

  useEffect(() => {
    let cancelled = false;

    const loadModule = async () => {
      if (!Number.isFinite(moduleId) || moduleId <= 0) {
        setLoading(false);
        toast.error("Invalid module ID");
        return;
      }

      try {
        setLoading(true);

        let nextCourseId = initialCourseId;
        let nextCourse: Course | null = null;

        if (Number.isFinite(nextCourseId ?? NaN) && (nextCourseId ?? 0) > 0) {
          const courses = await getCourses();
          nextCourse = courses.find((item) => item.id === nextCourseId) ?? null;
        } else {
          const courses = await getCourses();

          for (const item of courses) {
            const courseModules = await getModules(item.id);

            if (courseModules.some((entry) => entry.id === moduleId)) {
              nextCourseId = item.id;
              nextCourse = item;
              break;
            }
          }
        }

        if (!nextCourseId || !Number.isFinite(nextCourseId)) {
          throw new Error("Unable to resolve course for this module");
        }

        const resolvedId = nextCourseId;

        setResolvedCourseId(resolvedId);
        setCourse(nextCourse);

        const data = await getModule(resolvedId, moduleId);

        if (cancelled) {
          return;
        }

        setFormData({
          title: data.title,
          description: data.description,
          order: data.order,
          is_published: data.is_published,
        });
      } catch (error) {
        console.error("Failed to load module", error);
        toast.error("Failed to load module");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadModule();

    return () => {
      cancelled = true;
    };
  }, [initialCourseId, moduleId]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!resolvedCourseId) {
      toast.error("Course ID is missing for this module");
      return;
    }

    try {
      setSaving(true);

      const response = await updateModule(
        resolvedCourseId,
        moduleId,
        formData
      );

      toast.success(
        response?.message || "Module updated successfully"
      );

      router.back();
    } catch (error) {
      console.error("Failed to update module", error);
      toast.error("Failed to update module");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <p className="text-slate-500">Loading module...</p>
      </div>
    );
  }

  if (!resolvedCourseId) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">
          Edit Module
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Unable to resolve the course for this module.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">
          Edit Module
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {course ? (
            <>
              <span className="font-medium text-slate-700">
                {course.name}
              </span>
              <span className="mx-2">-</span>
              <span>Course ID: {resolvedCourseId}</span>
            </>
          ) : (
            `Course ID: ${resolvedCourseId}`
          )}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-2 block text-sm font-medium">
            Module Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                title: e.target.value,
              }))
            }
            className="w-full rounded-xl border px-4 py-3"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Description
          </label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            className="w-full rounded-xl border px-4 py-3"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Order
          </label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                order: Number(e.target.value),
              }))
            }
            className="w-full rounded-xl border px-4 py-3"
            min={1}
            required
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={formData.is_published}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                is_published: e.target.checked,
              }))
            }
          />
          <label>Published</label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Updating..." : "Update Module"}
        </button>
      </form>
    </div>
  );
}
