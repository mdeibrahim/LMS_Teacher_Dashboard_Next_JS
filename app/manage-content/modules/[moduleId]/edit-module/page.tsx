import ModuleEditForm from "@/components/manage-content/ModuleEditForm";

type EditModulePageProps = {
  params: Promise<{
    moduleId: string;
  }>;
  searchParams?: {
    courseId?: string;
  };
};

export default async function EditModulePage({
  params,
  searchParams,
}: EditModulePageProps) {
  const { moduleId } = await params;
  const moduleIdNumber = Number(moduleId);
  const courseIdParam = searchParams?.courseId;
  const courseId = courseIdParam ? Number(courseIdParam) : undefined;

  return (
    <ModuleEditForm
      courseId={
        Number.isFinite(courseId ?? NaN)
          ? (courseId as number)
          : undefined
      }
      moduleId={moduleIdNumber}
    />
  );
}
