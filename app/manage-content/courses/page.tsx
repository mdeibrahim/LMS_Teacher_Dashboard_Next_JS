import Sidebar from "@/components/dashboard/Sidebar";
import CourseGrid from "@/components/dashboard/CourseGrid";

export default function CoursesPage() {
  return (
    <div className="bg-slate-50 min-h-screen flex">
      <Sidebar />

      <main className="flex-1 p-10">
         {/* add StatsCards.tsx with new values */}
        <div className="grid md:grid-cols-4 gap-5 text-xs text-center rounded-2xl">
          <div className="bg-gray-200 rounded-2xl p-2 shadow-sm hover:bg-gray-300 transition-colors">
            <h3 className="text-3xl font-bold text-blue-600">
              10
            </h3>
            <p className="text-gray-500 mt-2">
              Total Courses
            </p>
          </div>

          <div className="bg-gray-200 rounded-2xl p-2 shadow-sm hover:bg-gray-300 transition-colors">
            <h3 className="text-3xl font-bold text-blue-600">
              8
            </h3>
            <p className="text-gray-500 mt-2">
              Active Courses
            </p>
          </div>

          <div className="bg-gray-200 rounded-2xl p-2 shadow-sm hover:bg-gray-300 transition-colors">
            <h3 className="text-3xl font-bold text-blue-600">
              2
            </h3>
            <p className="text-gray-500 mt-2">
              Draft Courses
            </p>
          </div>
            <div className="bg-gray-200 rounded-2xl p-2 shadow-sm hover:bg-gray-300 transition-colors cursor-pointer">
            <h1 className="text-5xl font-bold text-green-600">
              +
            </h1>
            <p className=" font-bold text-emerald-600">
               Add New Course
            </p>
          </div>
        </div>

        <div className="space-y-8 mt-10">
          <CourseGrid />
        </div>
      </main>
    </div>
  );
}
