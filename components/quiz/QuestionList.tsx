"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { CheckCircle2, ListChecks, Pencil, Plus, Trash2 } from "lucide-react";

import type { QuizQuestion } from "@/services/quiz";

import QuestionModal from "./Questionmodal";

// Re-exported so existing imports of `type QuizQuestion` from this file keep working.
export type { QuizQuestion };

interface QuestionListProps {
  questions: QuizQuestion[];
  setQuestions: Dispatch<SetStateAction<QuizQuestion[]>>;
}

export default function QuestionList({
  questions,
  setQuestions,
}: QuestionListProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const openAdd = () => {
    setEditingIndex(null);
    setModalOpen(true);
  };

  const openEdit = (index: number) => {
    setEditingIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingIndex(null);
  };

  const handleSave = (question: QuizQuestion) => {
    setQuestions((current) => {
      if (editingIndex === null) {
        return [...current, { ...question, order: current.length + 1 }];
      }

      const next = [...current];
      next[editingIndex] = { ...next[editingIndex], ...question };
      return next;
    });

    closeModal();
  };

  const handleDelete = (index: number) => {
    setQuestions((current) =>
      current
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, order: i + 1 }))
    );
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
            <ListChecks className="text-blue-600" size={20} />
            Questions
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {questions.length} question{questions.length === 1 ? "" : "s"}{" "}
            added
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus size={16} />
          Add Question
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {questions.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            No questions yet. Click &ldquo;Add Question&rdquo; to create the
            first one.
          </p>
        ) : (
          questions.map((item, index) => (
            <div
              key={item.id ?? `draft-${index}`}
              className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-semibold text-slate-500 shadow-sm">
                    {index + 1}
                  </span>
                  <p className="font-medium text-slate-800">
                    {item.question}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(index)}
                    className="rounded-lg p-1.5 text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
                    title="Edit question"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(index)}
                    className="rounded-lg p-1.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                    title="Remove question"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="mt-3 grid gap-2 pl-10 sm:grid-cols-2">
                {(
                  [
                    ["A", item.option_a],
                    ["B", item.option_b],
                    ["C", item.option_c],
                    ["D", item.option_d],
                  ] as const
                ).map(([key, text]) => (
                  <div
                    key={key}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                      item.correct_option === key
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {item.correct_option === key ? (
                      <CheckCircle2 size={14} className="shrink-0" />
                    ) : (
                      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-slate-300 text-[9px] font-semibold">
                        {key}
                      </span>
                    )}
                    <span className="truncate">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <QuestionModal
        key={editingIndex ?? "new"}
        open={modalOpen}
        question={editingIndex !== null ? questions[editingIndex] : null}
        onClose={closeModal}
        onSave={handleSave}
      />
    </div>
  );
}