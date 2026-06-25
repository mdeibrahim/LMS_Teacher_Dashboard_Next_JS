import api from "./api";

export interface Lesson {
  id: number;
  title: string;
  body_content: string;
  order: number;
  is_published: boolean;
}

export type LessonMediaPayload = {
  id: number;
  title: string;
  contentType: "text" | "image" | "audio" | "video" | "youtube";
  textContent: string;
  youtubeUrl: string;
  fileName: string;
};

export type LessonAccordionPayload = {
  id: number;
  title: string;
  content: string;
  isOpenByDefault: boolean;
};

export type LessonPayload = {
  title: string;
  body_content: string;
  order: number;
  is_published: boolean;
  mediaItems: LessonMediaPayload[];
  accordionSections: LessonAccordionPayload[];
  mediaFiles: Map<number, File>;
};

const appendJsonField = (
  formData: FormData,
  key: string,
  value: unknown
) => {
  formData.append(key, JSON.stringify(value));
};

const appendMediaFiles = (
  formData: FormData,
  mediaItems: LessonMediaPayload[],
  mediaFiles: Map<number, File>
) => {
  mediaItems.forEach((item) => {
    const file = mediaFiles.get(item.id);

    if (!file) {
      return;
    }

    formData.append(`media_file_${item.id}`, file);
  });
};

const buildFormData = (data: LessonPayload) => {
  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("body_content", data.body_content);
  formData.append("order", String(data.order));
  formData.append(
    "is_published",
    String(data.is_published)
  );

  appendJsonField(formData, "resources", data.mediaItems);
  appendJsonField(
    formData,
    "accordion_sections",
    data.accordionSections
  );

  appendMediaFiles(formData, data.mediaItems, data.mediaFiles);

  return formData;
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
    `/create-lesson/?module_id=${moduleId}`,
    buildFormData(data),
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
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
    buildFormData(data),
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
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
