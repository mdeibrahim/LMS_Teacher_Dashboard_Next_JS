import LessonEditor from "@/components/lesson-editor/LessonEditor";

type EditLessonPageProps = {
  params: Promise<{ lessonId: string }>;
  searchParams?: Promise<{
    courseId?: string;
    moduleId?: string;
  }>;
};

function toPositiveNumber(value: string | null) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export default async function EditLessonPage({
  params,
  searchParams,
}: EditLessonPageProps) {
  const resolvedSearchParams = await searchParams;
  const resolvedParams = await params;
  const courseId = toPositiveNumber(resolvedSearchParams?.courseId ?? null);
  const moduleId = toPositiveNumber(resolvedSearchParams?.moduleId ?? null);
  const lessonId = toPositiveNumber(resolvedParams.lessonId);

  return (
    <LessonEditor
      initialLessonId={lessonId}
      initialCourseId={courseId}
      initialModuleId={moduleId}
    />
  );
}
