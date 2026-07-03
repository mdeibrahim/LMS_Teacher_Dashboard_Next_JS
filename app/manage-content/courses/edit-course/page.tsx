import EditCourseForm from "./_components/edit-course-form";

type EditCoursePageProps = {
  searchParams: Promise<{
    courseId?: string;
  }>;
};

export default async function EditCoursePage({
  searchParams,
}: EditCoursePageProps) {
  const resolvedSearchParams = await searchParams;
  const courseId = resolvedSearchParams.courseId;

  return <EditCourseForm courseId={courseId ? Number(courseId) : null} />;
}
