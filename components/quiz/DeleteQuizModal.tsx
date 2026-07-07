"use client";

import { AlertTriangle } from "lucide-react";

interface QuizDeleteModalProps {
  open: boolean;
  quizTitle?: string;
  deleting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function QuizDeleteModal({
  open,
  quizTitle,
  deleting = false,
  onCancel,
  onConfirm,
}: QuizDeleteModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm px-4"
      onClick={() => {
        if (!deleting) onCancel();
      }}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="text-red-600" size={22} />
        </div>

        <h2 className="mt-4 text-lg font-bold text-slate-900">
          Delete this quiz?
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          {quizTitle ? (
            <>
              This will permanently remove{" "}
              <span className="font-medium text-slate-700">
                &ldquo;{quizTitle}&rdquo;
              </span>{" "}
              along with all of its questions and student attempts. This
              action cannot be undone.
            </>
          ) : (
            "This will permanently remove the quiz along with all of its questions and student attempts. This action cannot be undone."
          )}
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
}