"use client"

import CourseGrid from "@/components/dashboard/CourseGrid";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCourses, type Course } from "@/services/courses";


export default function CoursesPage() {
  const [courses, setCourses] =
    useState<Course[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);

        const data = await getCourses();

        setCourses(data);
      } catch (error) {
        console.error(
          "Failed to fetch courses",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchCourses();
  }, []);

  const courseStats = [
    {
      title: "Total Courses",
      value: courses.length,
    },
    {
      title: "Active Courses",
      value: courses.filter(
        (course) => course.is_published
      ).length,
    },
    {
      title: "Draft Courses",
      value: courses.filter(
        (course) => !course.is_published
      ).length,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-slate-500">
          Loading courses...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-5 rounded-2xl text-center sm:grid-cols-2 xl:grid-cols-4">
        {courseStats.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl bg-gray-200 p-4 shadow-sm transition-colors hover:bg-gray-300"
          >
            <h3 className="text-3xl font-bold text-blue-600">
              {item.value}
            </h3>

            <p className="mt-2 text-gray-500">
              {item.title}
            </p>
          </div>
        ))}

        <Link
          href="/manage-content/courses/add-course"
          className="flex min-h-[120px] flex-col items-center justify-center rounded-2xl bg-gray-200 p-4 shadow-sm transition-all hover:bg-gray-300"
        >
          <span className="text-5xl font-bold text-green-600">
            +
          </span>

          <p className="mt-2 font-bold text-emerald-600">
            Add New Course
          </p>
        </Link>
      </div>

      <CourseGrid courses={courses} />
    </div>
  );
}