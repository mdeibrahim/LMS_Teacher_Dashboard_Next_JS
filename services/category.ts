import api from "./api";

export interface Subcategory {
  id: number;
  name: string;
  description?: string;
  category?: number;
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  subcategories: Subcategory[];
}

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get("/category-subcategory-list/");
  return response.data.data;
};