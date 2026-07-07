"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import type { CorrectOption, QuizQuestion } from "@/services/quiz";

interface QuestionModalProps {
  open: boolean;
  question: QuizQuestion | null;
  onClose: () => void;
  onSave: (question: QuizQuestion) => void;
}

const emptyDraft = {
  question: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_option: "A" as CorrectOption,
};

const optionFields: {
  key: "option_a" | "option_b" | "option_c" | "option_d";
  label: CorrectOption;
}[] = [
  { key: "option_a", label: "A" },
  { key: "option_b", label: "B" },
  { key: "option_c", label: "C" },
  { key: "option_d", label: "D" },
];

export default function QuestionModal({
  open,
  question,
  onClose,
  onSave,
}: QuestionModalProps) {
  const [draft, setDraft] = useState(emptyDraft);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setError(null);
    setDraft(
      question
        ? {
            question: question.question,
            option_a: question.option_a,
            option_b: question.option_b,
            option_c: question.option_c,
            option_d: question.option_d,
            correct_option: question.correct_option,
          }
        : emptyDraft
    );
  }, [open, question]);

  if (!open) {
    return null;
  }

  const handleSubmit = () => {
    if (!draft.question.trim()) {
      setError("Question text is required.");
      return;
    }

    const missingOption = optionFields.find(
      (field) => !draft[field.key].trim()
    );

    if (missingOption) {
      setError(`Option ${missingOption.label} cannot be empty.`);
      return;
    }

    onSave({
      ...question,
      question: draft.question.trim(),
      option_a: draft.option_a.trim(),
      option_b: draft.option_b.trim(),
      option_c: draft.option_c.trim(),
      option_d: draft.option_d.trim(),
      correct_option: draft.correct_option,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h3 className="text-lg font-semibold text-slate-800">
            {question ? "Edit Question" : "Add Question"}
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Question
            </label>
            <textarea
              value={draft.question}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, question: event.target.value }))
              }
              rows={3}
              placeholder="Type the question..."
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Options
              <span className="ml-2 text-xs font-normal text-slate-400">
                Select the radio button next to the correct answer.
              </span>
            </label>

            {optionFields.map((field) => (
              <div key={field.key} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      correct_option: field.label,
                    }))
                  }
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm font-semibold transition ${
                    draft.correct_option === field.label
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-slate-300 bg-white text-slate-500 hover:border-emerald-300"
                  }`}
                  title={`Mark ${field.label} as correct`}
                >
                  {field.label}
                </button>

                <input
                  type="text"
                  value={draft[field.key]}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      [field.key]: event.target.value,
                    }))
                  }
                  placeholder={`Option ${field.label}`}
                  className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                    draft.correct_option === field.label
                      ? "border-emerald-300 focus:ring-emerald-400"
                      : "border-slate-300 focus:ring-blue-500"
                  }`}
                />
              </div>
            ))}
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              {question ? "Save Question" : "Add Question"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}