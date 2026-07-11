"use client";

import axios from "axios";
import {
  ArrowRight,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FirebaseGoogleLogin } from "@/services/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { useAuth } from "@/contexts/AuthContext";

import { toast } from "sonner";


import Input from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import {
  RegisterTeacher,
  getBackendMessage,
} from "@/services/auth";



export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    password: "",
    confirm_password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };


  const router = useRouter();

  const { refreshProfile } = useAuth();
  
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      const response = await FirebaseGoogleLogin(idToken);
      
      const accessToken = response?.access_token || response?.access || response?.token;
      const refreshToken = response?.refresh_token || response?.refresh;

      if (typeof window !== "undefined") {
        if (accessToken) {
          localStorage.setItem("access_token", accessToken);
        }
        if (refreshToken) {
          localStorage.setItem("refresh_token", refreshToken);
        }
      }

      await refreshProfile();
      
      toast.success(response.message || "Login successful!");
      
      router.push("/dashboard");
    } catch (error: unknown) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        toast.error(getBackendMessage(error.response?.data, "Google login failed"));
      } else {
        toast.error((error instanceof Error ? error.message : "An unexpected error occurred during Google Sign-in"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match.");
      return;
    }


    try {
      setLoading(true);
      const response =
        await RegisterTeacher(formData);

      toast.success(
        getBackendMessage(
          response,
          "Teacher registered successfully"
        )
      );

      setTimeout(() => {
        router.replace(
          "/auth/verify-otp?email=" +
          encodeURIComponent(formData.email) +
          "&source=register"
        );
      }, 1000);

    } catch (error: unknown) {

      if (axios.isAxiosError(error)) {
        toast.error(
          getBackendMessage(
            error.response?.data,
            "Registration failed"
          )
        );
      } else {
        toast.error(
          "Unexpected error occurred"
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Full-screen loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="h-14 w-14 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
            <p className="text-sm font-semibold text-slate-600 tracking-wide">Creating your account...</p>
          </div>
        </div>
      )}
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl p-10">
      <div>
        <h4 className="text-2xl font-bold text-blue-600">
          Create your Account
        </h4>

        <p className="text-slate-500 mt-2 text-xs sm:text-base leading-relaxed">
          Join our community of innovative educators and share your assets.
        </p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div className="relative group">
          <Input
            label="Full Name"
            name="full_name"
            type="text"
            placeholder="Enter your full name"
            value={formData.full_name}
            onChange={handleChange}
            className="pr-11 transition-all text-black placeholder:text-gray-400 h-8 placeholder:text-sm group-focus-within:border-blue-500"
          />
          <User
            size={18}
            className="absolute right-4 top-7.5 text-gray-400 transition-colors group-focus-within:text-blue-500 pointer-events-none"
          />
        </div>

        <div className="relative group">
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="educator@institution.edu"
            value={formData.email}
            onChange={handleChange}
            className="pr-11 transition-all text-black placeholder:text-gray-400 h-8 placeholder:text-sm group-focus-within:border-blue-500"
          />
          <Mail
            size={18}
            className="absolute right-4 top-7.5 text-gray-400 transition-colors group-focus-within:text-blue-500 pointer-events-none"
          />
        </div>

        <div className="relative group">
          <Input
            label="Phone Number"
            name="phone_number"
            type="tel"
            placeholder="+880 123456789"
            value={formData.phone_number}
            onChange={handleChange}
            className="pr-11 transition-all text-black placeholder:text-gray-400 h-8 placeholder:text-sm group-focus-within:border-blue-500"
          />
          <Phone
            size={18}
            className="absolute right-4 top-7.5 text-gray-400 transition-colors group-focus-within:text-blue-500 pointer-events-none"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="relative group">
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="********"
              value={formData.password}
              onChange={handleChange}
              className="pr-11 transition-all text-black placeholder:text-gray-400 h-8 placeholder:text-sm group-focus-within:border-blue-500"
            />
            <Lock
              size={18}
              className="absolute right-4 top-7.5 text-gray-400 transition-colors group-focus-within:text-blue-500 pointer-events-none"
            />
          </div>

          <div className="relative group">
            <Input
              label="Confirm Password"
              name="confirm_password"
              type="password"
              placeholder="********"
              value={formData.confirm_password}
              onChange={handleChange}
              className="pr-11 transition-all text-black placeholder:text-gray-400 h-8 placeholder:text-sm group-focus-within:border-blue-500"
            />
            <Lock
              size={18}
              className="absolute right-4 top-7.5 text-gray-400 transition-colors group-focus-within:text-blue-500 pointer-events-none"
            />
          </div>
        </div>

        <div className="flex items-start gap-3 pt-8">
          <input
            id="terms"
            type="checkbox"
            className="mt-1 h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500  cursor-pointer transition"
          />
          <label htmlFor="terms" className="text-xs mt-0.5 text-slate-600 cursor-pointer select-none leading-tight">
            I agree to the{" "}
            <Link href="/terms" className="text-blue-600 text-xs hover:text-blue-700 font-medium underline underline-offset-4 decoration-sky-300/50 hover:decoration-blue-600 transition-all">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-4 decoration-sky-300/50 hover:decoration-blue-600 transition-all">
              Privacy Policy
            </Link>
          </label>
        </div>

        {/* if backend returns success redirect to OTP verification page */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-10 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span className="flex items-center justify-center gap-2 font-bold text-sm tracking-wide">
            {loading ? "Creating..." : "Create Account"}

            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1"
            />
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

      <button type="button" onClick={handleGoogleSignIn} disabled={loading} className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-lg py-3 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 text-slate-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed">
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

      <p className="text-center text-slate-600 mt-6 text-sm">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-blue-600 font-semibold hover:text-blue-700 transition"
        >
          Log In
        </Link>
      </p>
      </div>
    </>
  );
}
