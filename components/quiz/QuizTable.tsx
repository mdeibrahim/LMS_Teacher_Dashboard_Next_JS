"use client";

import Link from "next/link";
import {
  Loader2,
  Pencil,
  Trash2,
  FileQuestion,
} from "lucide-react";

import type { Quiz } from "@/services/quiz";

interface QuizTableProps {
  quizzes: Quiz[];
  loading: boolean;
  onDelete: (quizId: number) => void;
}

export default function QuizTable({
  quizzes,
  loading,
  onDelete,
}: QuizTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2
          className="animate-spin text-blue-600"
          size={40}
        />
      </div>
    );
  }

  if (!quizzes.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center">
        <FileQuestion
          className="mx-auto text-slate-300"
          size={54}
        />

        <h3 className="mt-5 text-xl font-semibold text-slate-800">
          No Quizzes Found
        </h3>

        <p className="mt-2 text-slate-500">
          No quizzes are available for the selected filters.
        </p>

        <Link
          href="/manage-content/quizzes/add-quiz"
          className="mt-6 inline-flex items-center rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
        >
          Create Quiz
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-200 px-6 py-5">

        <h2 className="text-lg font-semibold text-slate-800">
          Quiz List
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Total Quizzes: {quizzes.length}
        </p>

      </div>

      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="bg-slate-50">

            <tr>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                #
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                Quiz
              </th>

              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">
                Questions
              </th>

              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">
                Status
              </th>

              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {quizzes.map((quiz, index) => (

              <tr
                key={quiz.id}
                className="border-t border-slate-100 hover:bg-slate-50"
              >

                <td className="px-6 py-5">

                  {index + 1}

                </td>

                <td className="px-6 py-5">

                  <div>

                    <h3 className="font-semibold text-slate-800">
                      {quiz.title}
                    </h3>

                    {quiz.description && (
                      <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                        {quiz.description}
                      </p>
                    )}

                  </div>

                </td>

                <td className="px-6 py-5 text-center">

                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">

                    {quiz.question_count ?? 0}

                  </span>

                </td>

                <td className="px-6 py-5 text-center">

                  {quiz.is_published ? (

                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      Published
                    </span>

                  ) : (

                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                      Draft
                    </span>

                  )}

                </td>

                <td className="px-6 py-5">

                  <div className="flex justify-center gap-3">

                    <Link
                      href={`/manage-content/quizzes/${quiz.id}/edit`}
                      className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-blue-700 transition hover:bg-blue-100"
                    >
                      <Pencil size={16} />

                      Edit
                    </Link>

                    <button
                      onClick={() => onDelete(quiz.id)}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-600 transition hover:bg-red-100"
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