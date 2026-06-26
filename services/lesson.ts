import api from "./api";

/* ===========================
   Lesson
=========================== */

export interface Lesson {
  id: number;
  title: string;
  body_content: string;
  order: number;
  is_published: boolean;
}

/* ===========================
   Resource
=========================== */

export type ResourceContentType =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "pdf"
  | "youtube";

export interface ResourcePayload {
  id?: number;
  title: string;
  content_type: ResourceContentType;
  text_content?: string;
  external_url?: string;
  embed_url?: string;
  order: number;
  is_preview: boolean;
  is_published: boolean;
  duration_seconds?: number;

  /**
   * Used to match uploaded file
   */
  file_key?: string;
}

/* ===========================
   Accordion Section
=========================== */

export interface AccordionSection {
  id?: number;
  title: string;
  content: string;
  order: number;
  is_open_by_default: boolean;
}

/* ===========================
   Lesson Payload
=========================== */

export interface LessonPayload {
  title: string;
  body_content: string;
  order: number;
  is_published: boolean;
  resources: ResourcePayload[];
  accordion_sections: AccordionSection[];
  mediaFiles: Record<string, File>;
}

const appendJsonField = (
  formData: FormData,
  key: string,
  value: unknown
) => {
  formData.append(key, JSON.stringify(value));
};

const appendMediaFiles = (
  formData: FormData,
  mediaFiles: Record<string, File>
) => {
  Object.entries(mediaFiles).forEach(([key, file]) => {
    formData.append(key, file);
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

  appendJsonField(
    formData,
    "resources",
    data.resources
  );

  appendJsonField(
    formData,
    "accordion_sections",
    data.accordion_sections
  );

  appendMediaFiles(
    formData,
    data.mediaFiles
  );

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
