import Link from "next/link";
import { BookOpenCheck, Plus, Layers3 } from "lucide-react";

export default function LessonsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Lessons
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Lessons are created inside a module. Pick a module, then open the
            lesson editor to draft rich content, resources, and accordion
            sections.
          </p>
        </div>

        <Link
          href="/manage-content/modules"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <Layers3 size={14} />
          Browse Modules
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <BookOpenCheck className="text-blue-600" size={24} />
          <h2 className="mt-4 text-lg font-semibold text-slate-800">
            Module-first workflow
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Every lesson belongs to a module, so the editor starts with course
            and module context.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <Plus className="text-emerald-600" size={24} />
          <h2 className="mt-4 text-lg font-semibold text-slate-800">
            Rich editor tools
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Format text, link media, and collect accordion sections in one
            screen.
          </p>
        </div>

        <Link
          href="/manage-content/lessons/add-lesson"
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <BookOpenCheck className="text-amber-600" size={24} />
          <h2 className="mt-4 text-lg font-semibold text-slate-800">
            Start a new lesson
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Use the Add Lesson link from a module row to jump straight into the
            editor with the right module selected.
          </p>
        </Link>
      </div>
    </div>
  );
}
