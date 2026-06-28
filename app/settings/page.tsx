"use client";

import { UserCircle2 } from "lucide-react";

import ProfileForm from "@/components/profile/ProfileForm";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import ChangePasswordCard from "@/components/profile/ChangePasswordCard";

export default function ProfilePage() {
  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="flex flex-wrap items-start justify-between gap-6">

        <div>
          <div className="flex items-center gap-3">
            <UserCircle2
              className="text-blue-600"
              size={30}
            />

            <h1 className="text-xl font-bold text-slate-900">
              Update Profile
            </h1>
          </div>

          <p className="mt-3 max-w-2xl text-xs text-slate-500">
            Keep your teacher profile updated. Your information
            will be visible throughout the learning platform.
          </p>
        </div>

      </div>

      {/* Main */}

      <div className="grid gap-6 xl:grid-cols-3">

        {/* Avatar */}

        <div className="xl:col-span-1">

          <ProfileAvatar />

        </div>

        {/* Form */}

        <div className="xl:col-span-2">

          <ProfileForm />

        </div>

      </div>

      {/* Change Password */}

      <ChangePasswordCard />

    </div>
  );
}