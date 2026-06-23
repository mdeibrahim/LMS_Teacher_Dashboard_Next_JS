import api from "./api";

export interface Subcategory {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  subcategories: Subcategory[];
}

export const getCategories = async () => {
  const response = await api.get("/category-subcategory-list/");

  return response.data.data;
};