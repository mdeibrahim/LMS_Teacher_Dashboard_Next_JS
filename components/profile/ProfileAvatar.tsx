"use client";

import { useAuth } from "@/contexts/AuthContext";
            import { Camera, User } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

export default function ProfileAvatar() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { profile } = useAuth();
  const avatarSrc = profile?.profile_picture || "/default_pp.jpg";
  const [preview, setPreview] = useState<string | null>(null);
  const displaySrc = preview ?? avatarSrc;

  const handleChooseImage = () => {
    inputRef.current?.click();
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <h2 className="text-l font-semibold text-slate-800">
        Profile Picture
      </h2>

      <p className="mt-1 text-xs text-slate-500">
        Upload a profile photo.
      </p>

      <div className="mt-8 flex justify-center">

        <div className="relative mx-auto w-fit">
          <div className="relative h-44 w-44 overflow-hidden rounded-full border-4 border-blue-100 bg-slate-100 shadow-lg">
            {displaySrc ? (
              <Image
                src={displaySrc}
                alt="Profile"
                fill
                className="object-cover"
                loading="eager"
                priority
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User
                  className="text-slate-400"
                  size={80}
                />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleChooseImage}
            className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-lg transition-all hover:scale-105 hover:bg-blue-700"
          >
            <Camera size={18} />
          </button>
        </div>

      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleImageChange}
      />

      <p className="mt-6 text-center text-xs text-slate-400">
        Recommended size: 400 × 400 px
      </p>

    </div>
  );
}