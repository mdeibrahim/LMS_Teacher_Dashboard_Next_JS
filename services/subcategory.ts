import api from "./api";

export interface CreateSubcategoryPayload {
  name: string;
  description: string;
  category: number;
}

export type UpdateSubcategoryPayload = Partial<CreateSubcategoryPayload>;

export interface SubcategoryDetail {
  id: number;
  name: string;
  category: number;
  description: string;
  created_at: string;
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

export const getSubcategory = async (
  id: number
): Promise<SubcategoryDetail> => {
  const response = await api.get(
    `/subcategories/${id}/`
  );

  return response.data.data;
};

export const updateSubcategory = async (
  id: number,
  data: UpdateSubcategoryPayload
) => {
  const response = await api.patch(
    `/subcategories/${id}/`,
    data
  );

  return response.data;
};

export const deleteSubcategory = async (
  id: number
) => {
  const response = await api.delete(
    `/subcategories/${id}/`
  );

  return response.data;
};