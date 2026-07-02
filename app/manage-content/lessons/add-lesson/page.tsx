import LessonEditor from "@/components/lesson-editor/LessonEditor";

function toPositiveNumber(value: string | null) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

type AddLessonPageProps = {
  searchParams?: Promise<{
    courseId?: string;
    moduleId?: string;
    lessonId?: string;
  }>;
};

export default async function AddLessonPage({
  searchParams,
}: AddLessonPageProps) {
  const resolvedSearchParams = await searchParams;

  const courseId = toPositiveNumber(resolvedSearchParams?.courseId ?? null);
  const moduleId = toPositiveNumber(resolvedSearchParams?.moduleId ?? null);
  const lessonId = toPositiveNumber(resolvedSearchParams?.lessonId ?? null);

  return (
    <LessonEditor
      initialCourseId={courseId}
      initialModuleId={moduleId}
      initialLessonId={lessonId}
    />
  );
}
