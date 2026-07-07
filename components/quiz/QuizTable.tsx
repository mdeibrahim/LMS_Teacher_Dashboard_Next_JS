"use client";

import Link from "next/link";
import { BookOpen, Layers, Pencil, Trash2 } from "lucide-react";

import type { Quiz } from "@/services/quiz";

interface Props {
  quizzes: Quiz[];
  loading: boolean;
  onDelete: (quiz: Quiz) => void | Promise<void>;
}

export default function QuizTable({ quizzes, loading, onDelete }: Props) {
  if (loading) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        Loading quizzes...
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        No quizzes found. Try adjusting your filters, or create a new quiz.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-800">Quizzes</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Title
              </th>
              <th className="w-56 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Attached To
              </th>
              <th className="w-28 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Questions
              </th>
              <th className="w-28 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Pass Score
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
            {quizzes.map((quiz) => (
              <tr key={quiz.id} className="transition hover:bg-slate-50">
                <td className="px-6 py-4">
                  <h3 className="truncate font-medium text-slate-800">
                    {quiz.title}
                  </h3>
                  {quiz.course_title && (
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {quiz.course_title}
                    </p>
                  )}
                </td>

                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    {quiz.lesson_title ? (
                      <>
                        <BookOpen size={13} />
                        {quiz.lesson_title}
                      </>
                    ) : quiz.module_title ? (
                      <>
                        <Layers size={13} />
                        {quiz.module_title}
                      </>
                    ) : (
                      "Unassigned"
                    )}
                  </span>
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                  {quiz.question_count ?? quiz.questions?.length ?? 0}
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                  {quiz.pass_score}%
                </td>

                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      quiz.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {quiz.is_active ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/manage-content/quizzes/edit-quiz/${quiz.id}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                    >
                      <Pencil size={16} />
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() => onDelete(quiz)}
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