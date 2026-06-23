import api from "./api";

export interface Module {
  id: number;
  title: string;
  description: string;
  is_published: boolean;
}

export const getModules = async (
  courseId: number
): Promise<Module[]> => {
  const response = await api.get(
    `/module-list/${courseId}/`
  );

  return response.data.data;
};