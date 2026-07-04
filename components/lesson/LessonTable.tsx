"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

import type { Lesson } from "@/services/lesson";

interface Props {
  lessons: Lesson[];
  loading: boolean;
  courseId?: number;
  moduleId?: number;
  onDelete: (id: number) => void | Promise<void>;
}

export default function LessonTable({
  lessons,
  loading,
  courseId,
  moduleId,
  onDelete,
}: Props) {
  // if (!moduleId) {
  //   return (
  //     <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
  //       Select a module to view its lessons.
  //     </div>
  //   );
  // }

  if (loading) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        Loading lessons...
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        No lessons found for this module.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-800">
          Lessons
        </h2>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200">
  <table className="min-w-full table-fixed divide-y divide-slate-200">
    <thead className="bg-slate-50">
      <tr>
        <th className="w-20 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          Order
        </th>

        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          Title
        </th>

        <th className="w-32 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          Status
        </th>

        <th className="w-56 px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
          Actions
        </th>
      </tr>
    </thead>

    <tbody className="divide-y divide-slate-200 bg-white">
      {lessons.map((lesson) => (
        <tr
          key={lesson.id}
          className="hover:bg-slate-50 transition"
        >
          {/* Order */}
          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-600">
            {lesson.order}
          </td>

          {/* Title */}
          <td className="px-6 py-4">
            <div className="max-w-xl">
              <h3 className="truncate font-medium text-slate-800">
                {lesson.title}
              </h3>

              <p className="mt-1 line-clamp-2 break-words text-sm text-slate-500">
                {lesson.body_content
                  ?.replace(/<[^>]+>/g, "")
                  .replace(/\s+/g, " ")
                  .trim()}
              </p>
            </div>
          </td>

          {/* Status */}
          <td className="whitespace-nowrap px-6 py-4">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                lesson.is_published
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {lesson.is_published
                ? "Published"
                : "Draft"}
            </span>
          </td>

          {/* Actions */}
          <td className="whitespace-nowrap px-6 py-4 text-right">
            <div className="flex justify-end gap-2">
              <Link
                href={`/manage-content/lessons/add-lesson?courseId=${
                  courseId ?? ""
                }&moduleId=${moduleId}&lessonId=${lesson.id}`}
                className="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
              >
                <Pencil size={16} />
                Edit
              </Link>

              <button
                type="button"
                onClick={() => {
                  // Directly invoke the delete handler (modal handled at page level)
                  onDelete(lesson.id);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <Trash2 size={16} />
                Delete
              </button>

            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
    </div>
  );
}
