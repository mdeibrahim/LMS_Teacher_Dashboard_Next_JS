"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({
  children,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200">

      <div className="flex min-h-screen items-center justify-center px-4 py-10">

        <div className="w-full max-w-md">

          {/* Logo */}

          <div className="mb-8 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-lg">

              <GraduationCap
                className="text-white"
                size={30}
              />

            </div>

            <h1 className="mt-5 text-2xl font-bold text-slate-900">
              Teacher Dashboard
            </h1>

            <p className="mt-2 text-xs text-slate-500">
              Learning Management System
            </p>

          </div>

          {/* Card */}

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xl">

            {/* <div className="mb-8 text-center">

              <h2 className="text-2xl font-bold text-slate-900">
                {title}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {subtitle}
              </p>

            </div> */}

            {children}

          </div>

          {/* Footer */}

          {/* <div className="mt-6 text-center">

            <Link
              href="/login"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              ← Back to Login
            </Link>

          </div> */}

        </div>

      </div>

    </div>
  );
}
