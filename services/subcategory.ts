import api from "./api";

export interface CreateSubcategoryPayload {
  name: string;
  description: string;
  category: number;
}

export const createSubcategory = async (
  data: CreateSubcategoryPayload
) => {
  const response = await api.post(
    "/create-subcategory/",
    data
  );

  return response.data;
};
