"use client";

import { useState } from "react";

import QuestionList, {
  type QuizQuestion,
} from "@/components/quiz/QuestionList";
import QuizInfoCard from "@/components/quiz/QuizInfoCard";

export default function AddQuizPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  return (
    <div className="space-y-6">

      <div>

        <h1 className="text-3xl font-bold">
          Create Quiz
        </h1>

        <p className="mt-2 text-slate-500">
          Create quizzes and add questions for your
          students.
        </p>

      </div>

      <QuizInfoCard />

      <QuestionList
        questions={questions}
        setQuestions={setQuestions}
      />

    </div>
  );
}