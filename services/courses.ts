import api from "./api";

export const getCourses = async () => {
  const response = await api.get("/teacher/courses/");
  return response.data;
};