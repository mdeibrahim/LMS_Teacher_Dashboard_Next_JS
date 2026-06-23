"use client";

import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  Pencil,
  Trash2,
  Plus,
  Layers3,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCourses, type Course } from "@/services/courses";
import { getModules, Module } from "@/services/module";

export default function ModulesPage() {
  const [expandedCourse, setExpandedCourse] = useState<
    number | null
  >(null);

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<
    Record<number, Module[]>
  >({});

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);

        const data = await getCourses();

        setCourses(data);

        console.log("Courses:", data);
      } catch (error) {
        console.error("Failed to fetch courses", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchCourses();
  }, []);

  const toggleCourse = async (courseId: number) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
      return;
    }

    setExpandedCourse(courseId);

    if (!modules[courseId]) {
      try {
        const data = await getModules(courseId);

        setModules((prev) => ({
          ...prev,
          [courseId]: data,
        }));
      } catch (error) {
        console.error(error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-500">Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Modules
          </h1>

          <p className="text-slate-500 mt-2 text-xs">
            Manage course modules and lessons
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl pl-10 p-4 shadow-sm">
          <p className="text-slate-500 text-sm">
            Total Courses
          </p>

          <h2 className="text-2xl font-bold text-blue-600 mt-2">
            {courses.length}
          </h2>
        </div>

        <div className="bg-white rounded-xl pl-10 p-4 shadow-sm">
          <p className="text-slate-500 text-sm">
            Total Modules
          </p>

          <h2 className="text-2xl font-bold text-green-600 mt-2">
            {courses.reduce(
              (sum, course) =>
                sum + course.modules_count,
              0
            )}
          </h2>
        </div>

        <div className="bg-white rounded-xl pl-10 p-4 shadow-sm">
          <p className="text-slate-500 text-sm">
            Active Courses
          </p>

          <h2 className="text-2xl font-bold text-purple-600 mt-2">
            {
              courses.filter(
                (c) => c.is_published
              ).length
            }
          </h2>
        </div>
      </div>

      {/* Courses */}
      <div className="space-y-2">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-400 "
          >
            {/* Course Card */}
            <div className="p-4 md:pl-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-2xl">
                    <BookOpen
                      className="text-blue-600"
                      size={18}
                    />
                  </div>

                  <div>
                    <h3 className="text-md font-bold text-slate-800">
                      {course.name}
                    </h3>

                    <p className="text-slate-500 text-xs mt-1">
                      {course.modules_count} Modules
                    </p>
                  </div>
                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${course.is_published
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                        }`}
                    >
                      {course.is_published
                        ? "Active"
                        : "Draft"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-90">
                  <Link
                    href="/manage-content/modules/add-module"
                    className="mt-3 flex cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-slate-300 py-2 p-3 text-sm font-medium text-slate-500 transition hover:border-blue-700 hover:text-blue-600"
                  >
                    <Plus size={14} />
                    Add Module
                  </Link>

                  <button
                    onClick={() => toggleCourse(course.id)}
                    className="flex items-center gap-2 text-blue-600 font-medium text-xs hover:text-blue-800 cursor-pointer"
                  >
                    {expandedCourse === course.id ? (
                      <>
                        <ChevronDown size={14} />
                        Hide Modules
                      </>
                    ) : (
                      <>
                        <ChevronRight size={14} />
                        View Modules
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Modules */}
            {expandedCourse === course.id && (
              <div className="bg-slate-50 p-0 pl-20 pb-10">
                <div className="space-y-2 pr-15">
                  {(modules[course.id] || []).map((module) => (
                      <div
                        key={module.id}
                        className="bg-white rounded-2xl p-2 shadow-sm border border-gray-400 hover:shadow-md transition  mr-30"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="bg-indigo-100 p-2 rounded-xl">
                              <Layers3
                                className="text-indigo-600"
                                size={
                                  14
                                }
                              />
                            </div>

                            <div>
                              <h4 className="font-semibold text-sm text-slate-800">
                                {
                                  module.title
                                }
                              </h4>

                              <p className="text-xs text-slate-500">
                                {
                                  module.description
                                }
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-10 pr-5">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${module.is_published
                                  ? "bg-green-100 text-green-700"
                                  : "bg-amber-100 text-amber-700"
                                }`}
                            >
                              {module.is_published
                                ? "Active"
                                : "Draft"}
                            </span>

                                      
                            <button className="text-blue-600 p-1 rounded-2xl hover:text-white hover:bg-blue-500 cursor-pointer">
                              <Pencil
                                size={14}
                              />
                            </button>

                            <button className="text-red-500 p-1 rounded-2xl hover:text-white hover:bg-red-500 cursor-pointer">
                              <Trash2
                                size={14}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                  <button className="w-full border border-dashed border-slate-300 rounded-2xl py-2 text-slate-500 hover:border-blue-500 hover:text-blue-600 transition font-medium text-sm mt-3">
                    + Add New Module
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
