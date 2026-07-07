"use client";

import QuizEditor from "@/components/quiz/QuizEditor";

export default function AddQuizPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Quiz</h1>
        <p className="mt-2 text-slate-500">
          Create quizzes and add questions for your students.
        </p>
      </div>

      <QuizEditor />
    </div>
  );
}