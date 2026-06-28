"use client";

import { useRef, useState } from "react";
import { Camera, Trash2, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

export default function ProfileAvatar() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { profile, loading } = useAuth();
  const avatarSrc = profile?.profile_picture || "/default_pp.jpg";
  const [preview, setPreview] = useState(avatarSrc);

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

  const handleRemove = () => {
    setPreview(avatarSrc);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
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
    {preview ? (
      <Image
        src={preview}
        alt="Profile"
        fill
        className="object-cover"
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

      <div className="mt-8 space-y-3 items-baseline flex flex-col md:flex-row md:space-x-3 md:space-y-0">

        <button
          type="button"
          onClick={handleChooseImage}
          className="w-auto rounded-xl bg-blue-600 px-4 py-3 text-xs font-medium text-white transition hover:bg-blue-700"
        >
          Upload New Photo
        </button>

        <button
          type="button"
          onClick={handleRemove}
          className="flex w-auto items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-xs font-medium text-red-600 transition hover:bg-red-200"
        >
          <Trash2 size={16} />

          Remove Photo
        </button>

      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        Recommended size: 400 × 400 px
      </p>

    </div>
  );
}