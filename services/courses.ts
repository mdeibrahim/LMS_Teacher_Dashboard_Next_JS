import api from "./api";

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
  const response = await api.get(
    `/course-detail/${courseId}/`
  );

  return response.data.data;
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
