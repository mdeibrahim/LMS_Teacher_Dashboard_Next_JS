import api from "./api";

export interface ModuleCourse {
  id?: number;
  name?: string;
}

export interface Module {
  id: number;
  title: string;
  description: string;
  order: number;
  is_published: boolean;
  slug?: string;
  lesson_count?: number;
  course?: ModuleCourse;
}

export type ModuleFormData = {
  title: string;
  description: string;
  order: number;
  is_published: boolean;
};

type ModuleListResponse =
  | Module[]
  | {
      message?: string;
      data?: Module[] | Module;
    };

const buildFormData = (data: ModuleFormData) => {
  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("order", String(data.order));
  formData.append(
    "is_published",
    String(data.is_published)
  );

  return formData;
};

export const getModules = async (
  courseId: number
): Promise<Module[]> => {
  const response = await api.get<ModuleListResponse>(
    `/module-list/?course_id=${courseId}`
  );

  const payload = response.data;

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
};

export const getModule = async (
  courseId: number,
  moduleId: number
): Promise<Module> => {
  const response = await api.get<ModuleListResponse>(
    `/module-list/?course_id=${courseId}&module_id=${moduleId}`
  );

  const payload = response.data;

  if (!Array.isArray(payload) && payload && typeof payload === "object") {
    if (
      "data" in payload &&
      payload.data &&
      !Array.isArray(payload.data)
    ) {
      return payload.data as Module;
    }

    if ("id" in payload && "title" in payload) {
      return payload as Module;
    }
  }

  throw new Error("Module details were not returned by the API");
};

export const createModule = async (
  courseId: number,
  data: ModuleFormData
) => {
  const response = await api.post(
    `/create-module/?course_id=${courseId}`,
    buildFormData(data),
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const updateModule = async (
  courseId: number,
  moduleId: number,
  data: ModuleFormData
) => {
  const response = await api.patch(
    `/create-module/?course_id=${courseId}&module_id=${moduleId}`,
    buildFormData(data),
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const deleteModule = async (
  courseId: number,
  moduleId: number
) => {
  const response = await api.delete(
    `/create-module/?course_id=${courseId}&module_id=${moduleId}`
  );

  return response.data;
};
