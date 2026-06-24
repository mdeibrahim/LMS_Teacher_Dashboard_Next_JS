import api from "./api";

export interface Lesson {
  id: number;
  title: string;
  body_content: string;
  order: number;
  is_published: boolean;
}

export type LessonPayload = {
  title: string;
  body_content: string;
  order: number;
  is_published: boolean;
};

export const getLessons = async (
  moduleId: number
): Promise<Lesson[]> => {
  const response = await api.get(
    `/lesson-list/${moduleId}/`
  );

  return response.data.data ?? [];
};

export const getLesson = async (
  moduleId: number,
  lessonId: number
): Promise<Lesson> => {
  const response = await api.get(
    `/lesson-list/${moduleId}/?lesson_id=${lessonId}`
  );

  return response.data.data;
};

export const createLesson = async (
  moduleId: number,
  data: LessonPayload
) => {
  const response = await api.post(
    `/lesson-list/${moduleId}/`,
    data
  );

  return response.data;
};

export const updateLesson = async (
  moduleId: number,
  lessonId: number,
  data: LessonPayload
) => {
  const response = await api.patch(
    `/lesson-list/${moduleId}/?lesson_id=${lessonId}`,
    data
  );

  return response.data;
};

export const deleteLesson = async (
  moduleId: number,
  lessonId: number
) => {
  const response = await api.delete(
    `/lesson-list/${moduleId}/?lesson_id=${lessonId}`
  );

  return response.data;
};
