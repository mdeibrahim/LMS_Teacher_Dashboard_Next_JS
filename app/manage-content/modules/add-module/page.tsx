"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useState,
  Suspense,
} from "react";
import { toast } from "sonner";

import { getCourses, type Course } from "@/services/courses";
import {
  createModule,
  getModules,
  type Module,
} from "@/services/module";

type AddModuleFormData = {
  title: string;
  description: string;
  order: number;
  is_published: boolean;
};

function AddModuleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const courseIdParam = searchParams.get("courseId");
  const courseId = courseIdParam ? Number(courseIdParam) : NaN;

  const [course, setCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<AddModuleFormData>({
    title: "",
    description: "",
    order: 1,
    is_published: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!Number.isFinite(courseId) || courseId <= 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const [coursesData, modulesData] = await Promise.all([
          getCourses(),
          getModules(courseId),
        ]);

        setCourses(coursesData);
        setModules(modulesData);
        setCourse(
          coursesData.find((item) => item.id === courseId) ?? null
        );
      } catch (error) {
        console.error("Failed to load course module data", error);
        toast.error("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [courseId]);

  const courseStats = [
    {
      title: "Total Courses",
      value: courses.length,
    },
    {
      title: "Total Modules",
      value: modules.length,
    },
    {
      title: "Draft Modules",
      value: modules.filter((module) => !module.is_published).length,
    },
  ];

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const target = e.target;
    const isCheckbox =
      target instanceof HTMLInputElement && target.type === "checkbox";

    setFormData((prev) => ({
      ...prev,
      [name]:
        isCheckbox ? target.checked : name === "order" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!Number.isFinite(courseId) || courseId <= 0) {
      toast.error("Invalid course ID");
      return;
    }

    try {
      setSubmitting(true);

      await createModule(courseId, formData);

      toast.success("Module created successfully");
      router.push("/manage-content/modules");
    } catch (error) {
      console.error("Failed to create module", error);
      toast.error("Failed to create module");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-slate-500">Loading course details...</p>
      </div>
    );
  }

  if (!Number.isFinite(courseId) || courseId <= 0) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">Add Module</h1>
        <p className="mt-2 text-sm text-slate-500">
          The course ID in the route is invalid.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-5 rounded-2xl text-center sm:grid-cols-2 xl:grid-cols-4">
        {courseStats.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl bg-gray-200 p-4 shadow-sm transition-colors hover:bg-gray-300"
          >
            <h3 className="text-3xl font-bold text-blue-600">{item.value}</h3>
            <p className="mt-2 text-gray-500">{item.title}</p>
          </div>
        ))}

        <Link
          href="/manage-content/modules"
          className="flex min-h-[120px] flex-col items-center justify-center rounded-2xl bg-gray-200 p-4 shadow-sm transition-all hover:bg-gray-300"
        >
          <span className="text-5xl font-bold text-green-600">&larr;</span>
          <p className="mt-2 font-bold text-emerald-600">Back to Modules</p>
        </Link>
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800">Selected Course</h2>
        <p className="mt-2 text-sm text-slate-500">
          {course ? (
            <>
              <span className="font-medium text-slate-700">{course.name}</span>
              <span className="mx-2">-</span>
              <span>Course ID: {courseId}</span>
            </>
          ) : (
            "Course not found."
          )}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Module Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter module title"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Write a short description"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Order
            </label>
            <input
              type="number"
              name="order"
              value={formData.order}
              min={1}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                name="is_published"
                checked={formData.is_published}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Publish immediately
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Create Module"}
          </button>

          <Link
            href="/manage-content/modules"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function AddModulePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddModuleContent />
    </Suspense>
  );
}
