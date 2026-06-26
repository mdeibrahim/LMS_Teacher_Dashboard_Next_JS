"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Mail, Lock, ArrowRight } from "lucide-react";

import Input from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { LoginTeacher } from "@/services/auth";
import { toast } from "sonner";
import axios from "axios";



export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };


  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await LoginTeacher(formData);
      const accessToken =
        response?.access ||
        response?.access_token ||
        response?.token;
      const refreshToken =
        response?.refresh ||
        response?.refresh_token;

      if (typeof window !== "undefined") {
        if (accessToken) {
          localStorage.setItem("access_token", accessToken);
        }

        if (refreshToken) {
          localStorage.setItem("refresh_token", refreshToken);
        }
      }

      toast.success(
        response.message || "Login successful"
      );
      setTimeout(() => {
        router.replace("/dashboard");
      }, 2000);

      console.log("Login successful:", response);
    } catch (error: unknown) {

      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.detail?.[0] || "Login failed");
      } 
      else {
        toast.error("Login failed");
      }
      console.error("Login failed:", error);
    
    } finally {
      setLoading(false);
    }
  }



  return (
    <div className="w-full max-w-md space-y-8 rounded-2xl border bg-white p-8 shadow-sm">
      <div className="flex flex-col items-center">
        <BookOpen className="mt-2 mb-2 text-blue-600" size={28} />

        <h2 className="mt-4 text-center text-3xl font-bold text-gray-900">
          Welcome Back
        </h2>

        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to your account
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="relative">
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="pl-10 transition-all text-black placeholder:text-gray-400 h-8 placeholder:text-sm group-focus-within:border-blue-500"
            />

            <Mail
              className="pointer-events-none absolute left-3 top-[30px] text-gray-400"
              size={20}
            />
          </div>

          <div className="relative">
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="pl-10 transition-all text-black placeholder:text-gray-400 h-8 placeholder:text-sm group-focus-within:border-blue-500"
            />

            <Lock
              className="pointer-events-none absolute left-3 top-[30px] text-gray-400"
              size={20}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Link
            href="#"
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            Forgot Password?
          </Link>
        </div>

        <Button 
          type="submit"
          disabled={loading}
          className="w-full h-10 flex items-center justify-center gap-2 text-xs font-semibold bg-blue-500 hover:bg-blue-700 text-white rounded-lg transition-all duration-200"
        >
          {loading ? "Signing in...": "Sign In"}
          <span className="flex text-xs font-semibold items-center justify-center gap-2">
            <ArrowRight size={14} />
          </span>
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-100"></div>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Or continue with
        </span>
        <div className="h-px flex-1 bg-slate-100"></div>
      </div>

      <button className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-lg py-3 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 text-slate-700 font-medium text-sm">
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.642 1.091 14.974 0 12 0 7.354 0 3.307 2.651 1.258 6.526l4.008 3.239z"
          />
          <path
            fill="#4285F4"
            d="M23.49 12.275c0-.818-.073-1.604-.21-2.364H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.77 2.92c2.2-2.03 3.65-5.02 3.65-8.646z"
          />
          <path
            fill="#FBBC05"
            d="M5.266 14.235A7.098 7.098 0 0 1 4.909 12c0-.79.13-1.55.357-2.265L1.258 6.5c-.81 1.63-1.258 3.47-1.258 5.5s.448 3.87 1.258 5.5l4.008-3.265z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.97-1.07 7.96-2.91l-3.77-2.92c-1.08.73-2.47 1.17-4.19 1.17-3.23 0-5.97-2.18-6.95-5.11l-4.04 3.14C3.21 21.32 7.27 24 12 24z"
          />
        </svg>
        Google
      </button>

      <p className="text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/register"
          className="font-medium text-blue-600"
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
}
