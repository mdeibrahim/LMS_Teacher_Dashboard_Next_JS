"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import { getCourses, type Course } from "@/services/courses";
import CourseCard from "./CourseCard";

interface CourseGridProps {
  courses?: Course[];
  getCourseHref?: (courseId: number) => string;
}

export default function CourseGrid({
  courses: providedCourses,
  getCourseHref,
}: CourseGridProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(
    !providedCourses
  );

  useEffect(() => {
    if (providedCourses) return;

    const loadCourses = async () => {
      try {
        const data = await getCourses();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);

        if (
          axios.isAxiosError(error) &&
          (error.response?.status === 401 ||
            error.response?.status === 403)
        ) {
          setCourses([]);
        }
      } finally {
        setLoading(false);
      }
    };

    void loadCourses();
  }, [providedCourses]);

  const displayedCourses =
    providedCourses ?? courses;
  const isLoading = providedCourses
    ? false
    : loading;

  if (isLoading) {
    return (
      <section>
        <h2 className="mb-6 text-2xl font-bold">
          My Courses
        </h2>

        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          Loading courses...
        </div>
      </section>
    );
  }

  if (displayedCourses.length === 0) {
    return (
      <section>
        <h2 className="mb-6 text-2xl font-bold">
          My Courses
        </h2>

        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          No courses found yet.
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-6 text-2xl font-bold">
        My Courses
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {displayedCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            href={
              getCourseHref
                ? getCourseHref(course.id)
                : undefined
            }
          />
        ))}
      </div>
    </section>
  );
}
