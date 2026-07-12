"use client";

import { Mail, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  ForgotPassword,
  getBackendMessage,
} from "@/services/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!emailOrPhone.trim()) {
      toast.error("Email or phone number is required.");
      return;
    }

    try {
      setLoading(true);

      const response = await ForgotPassword({ email_or_phone: emailOrPhone });

      toast.success(
        getBackendMessage(
          response,
          "OTP sent successfully."
        )
      );

      router.push(
        `/auth/verify-otp?email_or_phone=${encodeURIComponent(emailOrPhone)}&source=forgot-password`
      );
    } catch (error) {
      console.error(error);

      toast.error(
        getBackendMessage(
          error,
          "Failed to send OTP."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Email or Phone Number
        </label>

        <div className="relative">
          <Mail
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={emailOrPhone}
            onChange={(e) =>
              setEmailOrPhone(e.target.value)
            }
            placeholder="teacher@example.com or +880123456789"
            className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none transition focus:border-blue-600"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <Send size={18} />

        {loading
          ? "Sending OTP..."
          : "Send OTP"}
      </button>
    </form>
  );
}
