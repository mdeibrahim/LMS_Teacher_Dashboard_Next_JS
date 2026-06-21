"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
  FolderTree,
  BookOpen,
  Layers3,
  BookOpenCheck,
  FileQuestion,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
  const [contentOpen, setContentOpen] = useState(true);

  return (
    <aside className="w-[280px] bg-white border-r border-slate-200 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-6 py-8">
        <h1 className="text-3xl font-bold text-blue-600">
          TeachPlatform
        </h1>
      </div>

      {/* User */}
      <div className="px-5">
        <div className="bg-slate-50 rounded-2xl p-3 flex items-center gap-3">
          <img
            src="https://i.pravatar.cc/150?img=5"
            alt="profile"
            className="w-12 h-12 rounded-full"
          />

          <div>
            <h3 className="font-semibold text-slate-800">
              Sarah Jenkins
            </h3>

            <p className="text-sm text-slate-500">
              Senior Instructor
            </p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 mt-8 px-2">
        {/* Dashboard */}
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-5 py-2 rounded-xl bg-blue-50 text-blue-600 font-medium"
        >
          <LayoutDashboard size={18} />
          Dashboard
        </Link>

        {/* Content Section */}
        <div className="mt-4">
          <button
            onClick={() => setContentOpen(!contentOpen)}
            className="w-full flex items-center justify-between px-5 py-0 text-slate-700 hover:bg-slate-50 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <FolderTree size={18} />
              <span className="font-medium">
                Manage Content
              </span>
            </div>

            {contentOpen ? (
              <ChevronDown size={18} />
            ) : (
              <ChevronRight size={18} />
            )}
          </button>

          {contentOpen && (
            <div className="ml-6 mt-3 space-y-1">
              <Link
                href="/dashboard/categories"
                className="flex items-center text-sm gap-2 px-3 py-1 rounded-xl text-slate-600 hover:bg-slate-50"
              >
                <FolderTree size={14} />
                Categories
              </Link>

              <Link
                href="/dashboard/subcategories"
                className="flex items-center text-sm gap-2 px-3 py-1 rounded-xl text-slate-600 hover:bg-slate-50"
              >
                <Layers3 size={14} />
                Subcategories
              </Link>

              <Link
                href="/manage-content/courses"
                className="flex items-center text-sm gap-2 px-3 py-1 rounded-xl text-slate-600 hover:bg-slate-50"
              >
                <BookOpen size={14} />
                Courses
              </Link>

              <Link
                href="/dashboard/modules"
                className="flex items-center text-sm gap-2 px-3 py-1 rounded-xl text-slate-600 hover:bg-slate-50"
              >
                <Layers3 size={14} />
                Modules
              </Link>

              <Link
                href="/dashboard/lessons"
                className="flex items-center text-sm gap-2 px-3 py-1 rounded-xl text-slate-600 hover:bg-slate-50"
              >
                <BookOpenCheck size={14} />
                Lessons
              </Link>

              <Link
                href="/dashboard/quizzes"
                className="flex items-center text-sm gap-2 px-3 py-1 rounded-xl text-slate-600 hover:bg-slate-50"
              >
                <FileQuestion size={14} />
                Quizzes
              </Link>
            </div>
          )}
        </div>

        {/* Settings */}
        <Link
          href="/dashboard/settings"
          className="mt-2 flex items-center gap-3 px-5 py-4 rounded-xl text-slate-700 hover:bg-slate-50"
        >
          <Settings size={18} />
          Settings
        </Link>
      </div>

      {/* Bottom */}
      <div className="border-t border-slate-200 p-5 space-y-3">
        <button className="flex items-center gap-3 text-slate-600 hover:text-blue-600">
          <HelpCircle size={20} />
          Help Center
        </button>

        <button className="flex items-center gap-3 text-slate-600 hover:text-red-500">
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}