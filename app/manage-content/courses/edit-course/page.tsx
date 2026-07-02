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

    return (
        <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                    Edit Course
                </p>

                <h1 className="mt-2 text-2xl font-bold text-slate-900">
                    {courseId ? `Course #${courseId}` : "Select a course"}
                </h1>

                <p className="mt-2 text-sm text-slate-600">
                    This page is now the target for course-card clicks. Add the edit form here next.
                </p>
            </div>
        </div>
    );
}
