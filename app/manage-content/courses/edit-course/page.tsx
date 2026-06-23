import Link from "next/link";



export default function CoursesPage() {
    return (
        <div className="space-y-8">
            <Link
                href="/manage-content/courses/add-course"
                className="flex min-h-[120px] flex-col items-center justify-center rounded-2xl bg-gray-200 p-4 shadow-sm transition-all hover:bg-gray-300"
            >
                <span className="text-5xl font-bold text-green-600">
                    +
                </span>
                <p className="mt-2 font-bold text-emerald-600">
                    Edit Course
                </p>
            </Link>
        </div>



    );
}
