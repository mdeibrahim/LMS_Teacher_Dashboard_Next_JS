
"use client";

import axios from "axios";
import { useEffect, useState } from "react";

import { getCourses, type Course } from "@/services/courses";

type StatCard = {
  title: string;
  value: number;
};

export default function StatsCards() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getCourses();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);

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

    void loadStats();
  }, []);

  const stats: StatCard[] = [
    {
      title: "Active Courses",
      value: courses.filter((course) => course.is_published)
        .length,
    },
    {
      title: "Total Students",
      value: courses.reduce(
        (sum, course) => sum + (course.enrollment_count ?? 0),
        0
      ),
    },
    {
      title: "Total Modules",
      value: courses.reduce(
        (sum, course) => sum + (course.modules_count ?? 0),
        0
      ),
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-5 text-xs text-center rounded-2xl">
      {stats.map((item) => (
        <div
          key={item.title}
          className="bg-gray-200 rounded-2xl p-2 shadow-sm hover:bg-gray-300 transition-colors"
        >
          <h3 className="text-3xl font-bold text-blue-600">
            {loading ? "--" : item.value}
          </h3>

          <p className="text-gray-500 mt-2">
            {item.title}
          </p>
        </div>
      ))}
    </div>
  );
}