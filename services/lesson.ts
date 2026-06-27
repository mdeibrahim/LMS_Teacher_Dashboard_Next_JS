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

export type LessonUpdatePayload = Partial<
  Omit<LessonPayload, "mediaFiles">
> & {
  mediaFiles?: Record<string, File>;
};

const appendJsonField = (
  formData: FormData,
  key: string,
  value: unknown
) => {
  if (value !== undefined) {
    formData.append(key, JSON.stringify(value));
  }
};

const appendMediaFiles = (
  formData: FormData,
  mediaFiles?: Record<string, File>
) => {
  if (!mediaFiles) {
    return;
  }

  Object.entries(mediaFiles).forEach(([key, file]) => {
    formData.append(key, file);
  });
};

const buildFormData = (
  data: LessonPayload | LessonUpdatePayload
) => {
  const formData = new FormData();

  if (data.title !== undefined) {
    formData.append("title", data.title);
  }

  if (data.body_content !== undefined) {
    formData.append("body_content", data.body_content);
  }

  if (data.order !== undefined) {
    formData.append("order", String(data.order));
  }

  if (data.is_published !== undefined) {
    formData.append(
      "is_published",
      String(data.is_published)
    );
  }

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
    `/lesson-list/?module_id=${moduleId}`
  );

  return response.data.data ?? [];
};

export const getLesson = async (
  moduleId: number,
  lessonId: number
): Promise<Lesson> => {
  const response = await api.get(
    `/lesson-list/?module_id=${moduleId}&lesson_id=${lessonId}`
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
  lessonId: number,
  data: LessonUpdatePayload
) => {
  const response = await api.patch(
    `/update-lesson/?lesson_id=${lessonId}`,
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
    `/delete-lesson/?module_id=${moduleId}&lesson_id=${lessonId}`
  );

  return response.data;
};
