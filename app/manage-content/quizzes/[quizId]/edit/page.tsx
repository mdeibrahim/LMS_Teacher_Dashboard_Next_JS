import QuizEditor from "@/components/quiz/QuizEditor";

type EditQuizPageProps = {
  params: { quizId: string };
};

function toPositiveNumber(value: string | null | undefined) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export default function EditQuizPage({ params }: EditQuizPageProps) {
  const quizId = toPositiveNumber(params.quizId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Quiz</h1>
        <p className="mt-2 text-slate-500">
          Update quiz details and questions.
        </p>
      </div>

      <QuizEditor initialQuizId={quizId} />
    </div>
  );
}