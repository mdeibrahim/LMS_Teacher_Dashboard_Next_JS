"use client";

import { useSearchParams } from "next/navigation";

import LessonEditor from "@/components/lesson-editor/LessonEditor";

function toPositiveNumber(value: string | null) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export default function AddLessonPage() {
  const searchParams = useSearchParams();

  const courseId = toPositiveNumber(searchParams.get("courseId"));
  const moduleId = toPositiveNumber(searchParams.get("moduleId"));

  return (
    <LessonEditor
      initialCourseId={courseId}
      initialModuleId={moduleId}
    />
  );
}
