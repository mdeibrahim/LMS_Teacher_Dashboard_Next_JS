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
  image?: File | string | null;
  explanation?: string;
  explanation_image?: File | string | null;
  explanation_note?: string;
  explanation_video_url?: string;
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

const buildQuizFormData = (data: QuizPayload | QuizUpdatePayload) => {
  const formData = new FormData();

  // Append root fields
  if (data.title !== undefined) formData.append("title", data.title);
  if (data.pass_score !== undefined)
    formData.append("pass_score", String(data.pass_score));
  if (data.order !== undefined) formData.append("order", String(data.order));
  if (data.is_active !== undefined)
    formData.append("is_active", String(data.is_active));
  if (data.module !== undefined)
    formData.append("module", data.module ? String(data.module) : "");
  if (data.lesson !== undefined)
    formData.append("lesson", data.lesson ? String(data.lesson) : "");

  // Append questions JSON and files
  if (data.questions !== undefined) {
    const serializedQuestions = data.questions.map((q, index) => {
      const qData: any = { ...q };

      if (q.image instanceof File) {
        const key = `question_image_${index}`;
        formData.append(key, q.image);
        qData.image_key = key;
        delete qData.image;
      }

      if (q.explanation_image instanceof File) {
        const key = `question_explanation_image_${index}`;
        formData.append(key, q.explanation_image);
        qData.explanation_image_key = key;
        delete qData.explanation_image;
      }

      return qData;
    });

    formData.append("questions", JSON.stringify(serializedQuestions));
  }

  return formData;
};

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
  const response = await api.post("/create-quiz/", buildQuizFormData(data), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateQuiz = async (
  quizId: number,
  data: QuizUpdatePayload
) => {
  const response = await api.patch(
    `/update-quiz/?quiz_id=${quizId}`,
    buildQuizFormData(data),
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return response.data;
};

export const deleteQuiz = async (quizId: number) => {
  const response = await api.delete(
    `/delete-quiz/?quiz_id=${quizId}`
  );

  return response.data;
};