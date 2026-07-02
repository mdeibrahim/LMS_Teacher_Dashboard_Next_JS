import api from "./api";

export interface Quiz {
  id: number;
  title: string;
  description?: string | null;
  question_count?: number;
  is_published: boolean;
}

export interface QuizListFilters {
  category?: number;
  sub_category?: number;
  course?: number;
}

type QuizListResponse =
  | Quiz[]
  | {
      message?: string;
      data?: Quiz[] | Quiz;
    };

const buildQueryString = (
  filters: QuizListFilters
) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(
    ([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    }
  );

  const query = params.toString();

  return query ? `?${query}` : "";
};

export const getQuizzes = async (
  filters: QuizListFilters = {}
): Promise<Quiz[]> => {
  const response = await api.get<QuizListResponse>(
    `/quiz-list/${buildQueryString(filters)}`
  );

  const payload = response.data;

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (payload.data && !Array.isArray(payload.data)) {
    return [payload.data as Quiz];
  }

  return [];
};

export const deleteQuiz = async (quizId: number) => {
  const response = await api.delete(
    `/delete-quiz/?quiz_id=${quizId}`
  );

  return response.data;
};