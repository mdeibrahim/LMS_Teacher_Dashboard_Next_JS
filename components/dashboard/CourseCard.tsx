"use client";

import Image from "next/image";
import Link from "next/link";

import type { Course } from "@/services/courses";

interface CourseCardProps {
  course: Course;
  href?: string;
}

export default function CourseCard({
  course,
  href,
}: CourseCardProps) {
  const status = course.is_published
    ? "active"
    : "draft";

  const image =
    course.cover_image ||
    "/default_course_cover.jpg";

  const cardHref =
    href || `/manage-content/courses/${course.id}`;

  return (
    <Link
      href={cardHref}
      className="block"
    >
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
        <div className="relative h-48 w-full">
          <Image
            src={image}
            alt={course.name}
            fill
            unoptimized
            className="object-cover"
          />

          <span
            className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${
              status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {status === "active"
              ? "Active"
              : "Draft"}
          </span>
        </div>

        <div className="p-5">
          <h3 className="font-bold text-xl text-slate-800 line-clamp-2">
            {course.name}
          </h3>

          <p className="text-sm text-gray-500 mt-2">
            {course.enrollment_count} Students
          </p>

          {course.price > 0 ? (
            <p className="mt-3 text-lg font-semibold text-blue-600">
              ৳{course.price}
            </p>
          ) : (
            <p className="mt-3 text-lg font-semibold text-green-600">
              Free
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
