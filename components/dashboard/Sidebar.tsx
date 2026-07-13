"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname} from "next/navigation";
import Image from "next/image";

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
  Users,
  Shield,
  GraduationCap,
  UserCheck,
  Smartphone,
  Key,
  CreditCard,
  ClipboardList,
  Award,
  FileText,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";


interface SidebarProps {
  closeSidebar?: () => void;
}

export default function Sidebar({
  closeSidebar,
}: SidebarProps) {
  const pathname = usePathname();
  const [contentOpen, setContentOpen] = useState(
    pathname.startsWith("/manage-content") ||
    pathname.startsWith("/dashboard")
  );
  const [adminOpen, setAdminOpen] = useState(
    pathname.startsWith("/admin")
  );
  
  const isActive = (href: string) => {
    return pathname === href;
  };

  const isActiveStartsWith = (prefix: string) => {
    return pathname.startsWith(prefix);
  };


  const { profile, loading, logout } =
  useAuth();
  const avatarSrc = profile?.profile_picture || "/default_pp.jpg";
  const isRemoteAvatar = avatarSrc.startsWith("http://") || avatarSrc.startsWith("https://");
  const isAdmin = profile?.is_admin === true;

  const handleLogout = () => {
  closeSidebar?.(); // Mobile sidebar থাকলে বন্ধ করবে
  logout();         // AuthContext-এর logout function call করবে
};
  
  return (
    <aside className="w-[280px] bg-white border-r border-slate-200 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-6 py-8">
        <h1 className="text-3xl font-bold text-blue-600">
          TeachPlatform
        </h1>
      </div>

      {/* User */}
      <div className="px-4">
        <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
          <Image
            src={avatarSrc}
            alt={profile?.full_name || "profile"}
            width={40}
            height={40}
            unoptimized={isRemoteAvatar}
            className="w-12 h-12 rounded-full object-cover"
          />

          <div>
            <h3 className="font-semibold text-slate-800">
              {loading ? "Loading..." : profile?.full_name || "Sarah Jenkins"}
            </h3>

            <p className="text-sm text-slate-500">
              {profile?.teacher_subject || "Senior Instructor"}
            </p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 mt-8 px-2">
        {/* Dashboard */}
        <Link
          href="/dashboard"
          onClick={closeSidebar}
          className={`flex items-center gap-3 px-5 py-2 rounded-xl font-medium ${isActive("/dashboard")
              ? "bg-blue-50 text-blue-600"
              : "text-slate-700 hover:bg-slate-50"
            }`}
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
                href="/manage-content/categories"
                onClick={closeSidebar}
                className={`flex items-center text-sm gap-2 px-3 py-1 rounded-xl font-medium ${isActive("/manage-content/categories")
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <FolderTree size={14} />
                Categories
              </Link>

              <Link
                href="/manage-content/subcategories"
                onClick={closeSidebar}
                className={`flex items-center text-sm gap-2 px-3 py-1 rounded-xl font-medium ${isActive("/manage-content/subcategories")
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <Layers3 size={14} />
                Subcategories
              </Link>

              <Link
                href="/manage-content/courses"
                onClick={closeSidebar}
                className={`flex items-center text-sm gap-2 px-3 py-1 rounded-xl font-medium ${pathname.startsWith("/manage-content/courses")
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <BookOpen size={14} />
                Subjects
              </Link>

              <Link
                href="/manage-content/modules"
                onClick={closeSidebar}
                className={`flex items-center text-sm gap-2 px-3 py-1 rounded-xl font-medium ${pathname.startsWith("/manage-content/modules")
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <Layers3 size={14} />
                Modules
              </Link>

              <Link
                href="/manage-content/lessons"
                onClick={closeSidebar}
                className={`flex items-center text-sm gap-2 px-3 py-1 rounded-xl font-medium ${pathname.startsWith("/manage-content/lessons")
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <BookOpenCheck size={14} />
                Lessons
              </Link>

              <Link
                href="/manage-content/quizzes"
                onClick={closeSidebar}
                className={`flex items-center text-sm gap-2 px-3 py-1 rounded-xl font-medium ${isActive("/manage-content/quizzes")
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <FileQuestion size={14} />
                Quizzes
              </Link>
            </div>
          )}
        </div>

        {isAdmin && (
          <div className="mt-4">
            <button
              onClick={() => setAdminOpen(!adminOpen)}
              className="w-full flex items-center justify-between px-5 py-0 text-slate-700 hover:bg-slate-50 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <Shield size={18} />
                <span className="font-medium">
                  Administrator
                </span>
              </div>

              {adminOpen ? (
                <ChevronDown size={18} />
              ) : (
                <ChevronRight size={18} />
              )}
            </button>

            {adminOpen && (
              <div className="ml-6 mt-3 space-y-1">
                <div className="px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                  People
                </div>

                <Link
                  href="/admin/users"
                  onClick={closeSidebar}
                  className={`flex items-center text-sm gap-2 px-3 py-1 rounded-xl font-medium ${isActive("/admin/users")
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <Users size={14} />
                  Users
                </Link>

                <Link
                  href="/admin/admins"
                  onClick={closeSidebar}
                  className={`flex items-center text-sm gap-2 px-3 py-1 rounded-xl font-medium ${isActive("/admin/admins")
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <Shield size={14} />
                  Admins
                </Link>

                <Link
                  href="/admin/teachers"
                  onClick={closeSidebar}
                  className={`flex items-center text-sm gap-2 px-3 py-1 rounded-xl font-medium ${isActive("/admin/teachers")
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <GraduationCap size={14} />
                  Teachers
                </Link>

                <Link
                  href="/admin/students"
                  onClick={closeSidebar}
                  className={`flex items-center text-sm gap-2 px-3 py-1 rounded-xl font-medium ${isActive("/admin/students")
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <UserCheck size={14} />
                  Students
                </Link>

                <Link
                  href="/admin/device-sessions"
                  onClick={closeSidebar}
                  className={`flex items-center text-sm gap-2 px-3 py-1 rounded-xl font-medium ${isActive("/admin/device-sessions")
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <Smartphone size={14} />
                  Device Sessions
                </Link>

                <Link
                  href="/admin/otps"
                  onClick={closeSidebar}
                  className={`flex items-center text-sm gap-2 px-3 py-1 rounded-xl font-medium ${isActive("/admin/otps")
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <Key size={14} />
                  OTPs
                </Link>

                <div className="px-3 py-1 mt-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                  Commerce
                </div>

                <Link
                  href="/admin/payment-submissions"
                  onClick={closeSidebar}
                  className={`flex items-center text-sm gap-2 px-3 py-1 rounded-xl font-medium ${isActive("/admin/payment-submissions")
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <CreditCard size={14} />
                  Payment Submissions
                </Link>

                <Link
                  href="/admin/enrollments"
                  onClick={closeSidebar}
                  className={`flex items-center text-sm gap-2 px-3 py-1 rounded-xl font-medium ${isActive("/admin/enrollments")
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <ClipboardList size={14} />
                  Enrollments
                </Link>

                <Link
                  href="/admin/certificates"
                  onClick={closeSidebar}
                  className={`flex items-center text-sm gap-2 px-3 py-1 rounded-xl font-medium ${isActive("/admin/certificates")
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <Award size={14} />
                  Certificates
                </Link>

                <div className="px-3 py-1 mt-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                  Operations
                </div>

                <Link
                  href="/admin/payment-instructions"
                  onClick={closeSidebar}
                  className={`flex items-center text-sm gap-2 px-3 py-1 rounded-xl font-medium ${isActive("/admin/payment-instructions")
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <FileText size={14} />
                  Payment Instructions
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Settings */}
        <Link
          href="/settings"
          onClick={closeSidebar}
          className={`mt-2 flex items-center gap-3 px-5 py-4 rounded-xl font-medium ${isActive("/settings")
              ? "bg-blue-50 text-blue-600"
              : "text-slate-700 hover:bg-slate-50"
            }`}
        >
          <Settings size={18} />
          Settings
        </Link>
      </div>

      {/* Bottom */}
      <div className="border-t border-slate-200 p-5 space-y-3">
        <button
          onClick={closeSidebar}
          className="flex items-center gap-3 text-slate-600 hover:text-blue-600"
        >
          <HelpCircle size={20} />
          Help Center
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-slate-600 hover:text-red-500"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}
