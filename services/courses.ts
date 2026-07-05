import api from "./api";
import type { Category, Subcategory } from "./category";

export interface Course {
  id: number;
  name: string;
  description: string;
  cover_image: string | null;
  price: number;
  enrollment_count: number;
  is_published: boolean;
  created_at: string;
  modules_count: number;
  category: Category | null;
  subcategory: Subcategory | null;
}

interface CourseResponse {
  message?: string;
  data: Course[];
}

export const getCourses = async (): Promise<Course[]> => {
  const response = await api.get("/course-list/");
  const payload = response.data as CourseResponse | Course[];

  if (Array.isArray(payload)) {
    return payload;
  }

  return payload.data ?? [];
};


export const getCourse = async (
  courseId: number
): Promise<Course> => {
  const url = `/course-detail/?course_id=${courseId}`;
  const response = await api.get(url);

  const payload = response.data;

  const course = payload?.data?.[0];

  if (!course || course === null) {
    throw new Error(payload?.message || "Course not found");
  }

  return course as Course;
};


export const createCourse = async (
  data: FormData
) => {
  const response = await api.post(
    "/create-course/",
    data,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return response.data;
};


export const updateCourse = async (
  courseId: number,
  data: FormData
) => {
  const response = await api.patch(
    `/update-course/?course_id=${courseId}`,
    data,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return response.data;
};
