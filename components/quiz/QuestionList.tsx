"use client";

import { Plus } from "lucide-react";

import QuestionCard from "./QuestionCard";

export interface QuizOption {
  id: number;
  text: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  explanation: string;
  marks: number;
  options: QuizOption[];
  correctAnswer: number;
}

interface Props {
  questions: QuizQuestion[];
  setQuestions: React.Dispatch<
    React.SetStateAction<QuizQuestion[]>
  >;
}

export default function QuestionList({
  questions,
  setQuestions,
}: Props) {
  const addQuestion = () => {
    const id = Date.now();

    setQuestions((prev) => [
      ...prev,
      {
        id,
        question: "",
        explanation: "",
        marks: 1,
        correctAnswer: 0,
        options: [
          { id: 1, text: "" },
          { id: 2, text: "" },
          { id: 3, text: "" },
          { id: 4, text: "" },
        ],
      },
    ]);
  };

  const updateQuestion = (
    id: number,
    question: QuizQuestion
  ) => {
    setQuestions((prev) =>
      prev.map((item) =>
        item.id === id ? question : item
      )
    );
  };

  const removeQuestion = (id: number) => {
    setQuestions((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  const duplicateQuestion = (id: number) => {
    const question = questions.find(
      (item) => item.id === id
    );

    if (!question) return;

    setQuestions((prev) => [
      ...prev,
      {
        ...structuredClone(question),
        id: Date.now(),
      },
    ]);
  };

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-xl font-semibold text-slate-800">
            Questions
          </h2>

          <p className="text-sm text-slate-500">
            Total Questions: {questions.length}
          </p>

        </div>

        <button
          onClick={addQuestion}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />

          Add Question
        </button>

      </div>

      {questions.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">

          <h3 className="text-lg font-semibold">
            No Questions Added
          </h3>

          <p className="mt-2 text-slate-500">
            Click the button above to create your
            first question.
          </p>

        </div>
      )}

      {questions.map((question, index) => (
        <QuestionCard
          key={question.id}
          index={index}
          question={question}
          onChange={(data) =>
            updateQuestion(question.id, data)
          }
          onDelete={() =>
            removeQuestion(question.id)
          }
          onDuplicate={() =>
            duplicateQuestion(question.id)
          }
        />
      ))}

    </div>
  );
}