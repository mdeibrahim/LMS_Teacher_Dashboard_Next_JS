import api from "./api";

/* ===========================
   Question
=========================== */

export type CorrectOption = "A" | "B" | "C" | "D";

export interface QuizQuestion {
  id?: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: CorrectOption;
  order?: number;
}

/* ===========================
   Quiz
=========================== */

export interface Quiz {
  id: number;
  module: number | null;
  module_title: string | null;
  lesson: number | null;
  lesson_title: string | null;
  course_title: string | null;
  title: string;
  pass_score: number;
  order: number;
  is_active: boolean;
  created_at: string;
  question_count: number;
  attempts_count: number;
  questions: QuizQuestion[];
}

export interface QuizListFilters {
  course_id?: number;
  module_id?: number;
  lesson_id?: number;
  [key: string]: number | string | undefined;
}

export interface QuizPayload {
  title: string;
  pass_score: number;
  order: number;
  is_active: boolean;
  module?: number | null;
  lesson?: number | null;
  questions: QuizQuestion[];
}

export type QuizUpdatePayload = Partial<QuizPayload>;

type ApiEnvelope<T> = {
  message?: string;
  data?: T;
};

const buildQueryString = (
  filters: Record<string, number | string | undefined>
) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const query = params.toString();

  return query ? `?${query}` : "";
};

export const getQuizzes = async (
  filters: QuizListFilters = {}
): Promise<Quiz[]> => {
  const response = await api.get<ApiEnvelope<Quiz[]> | Quiz[]>(
    `/quiz-list/${buildQueryString(filters)}`
  );

  const payload = response.data;

  if (Array.isArray(payload)) {
    return payload;
  }

  return payload.data ?? [];
};

export const getQuiz = async (quizId: number): Promise<Quiz> => {
  const response = await api.get<ApiEnvelope<Quiz>>(
    `/quiz-list/?quiz_id=${quizId}`
  );

  return response.data.data as Quiz;
};

export const createQuiz = async (data: QuizPayload) => {
  const response = await api.post("/create-quiz/", data);
  return response.data;
};

export const updateQuiz = async (
  quizId: number,
  data: QuizUpdatePayload
) => {
  const response = await api.patch(
    `/update-quiz/?quiz_id=${quizId}`,
    data
  );

  return response.data;
};

export const deleteQuiz = async (quizId: number) => {
  const response = await api.delete(
    `/delete-quiz/?quiz_id=${quizId}`
  );

  return response.data;
};