"use client";

import { useParams, useSearchParams } from "next/navigation";

import ModuleEditForm from "@/components/manage-content/ModuleEditForm";

export default function EditModulePage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const moduleIdValue = params.moduleId;
  const moduleId = Number(
    Array.isArray(moduleIdValue)
      ? moduleIdValue[0]
      : moduleIdValue
  );
  const courseIdParam = searchParams.get("courseId");
  const courseId = courseIdParam ? Number(courseIdParam) : undefined;

  return (
    <ModuleEditForm
      courseId={
        Number.isFinite(courseId ?? NaN)
          ? (courseId as number)
          : undefined
      }
      moduleId={moduleId}
    />
  );
}
