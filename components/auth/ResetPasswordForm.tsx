"use client";

import {
    Eye,
    EyeOff,
    Lock,
    Save,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
    ResetPassword,
    getBackendMessage,
} from "@/services/auth";

export default function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const emailOrPhone = searchParams.get("email_or_phone") ?? searchParams.get("email") ?? "";
    const reset_token = searchParams.get("reset_token") ?? "";

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (!password.trim()) {
            toast.error("Password is required.");
            return;
        }

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            await ResetPassword({
                email_or_phone: emailOrPhone,
                reset_token : reset_token,
                password,
                confirm_password: confirmPassword,
            });

            toast.success(
                "Password updated successfully."
            );

            router.replace("/auth/login");
        } catch (error) {
            console.error(error);

            toast.error(
                getBackendMessage(
                    error,
                    "Unable to reset password."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        New Password
                    </label>

                    <div className="relative">
                        <Lock
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-12 outline-none transition focus:border-blue-600"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Confirm Password
                    </label>

                    <div className="relative">
                        <Lock
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                            className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-12 outline-none transition focus:border-blue-600"
                        />

                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div>
                    <div className="mb-2 flex justify-between text-sm">
                        <span className="text-slate-500">Password Strength</span>

                        <span
                            className={`font-medium ${password.length >= 12
                                ? "text-green-600"
                                : password.length >= 8
                                    ? "text-yellow-600"
                                    : "text-red-500"
                                }`}
                        >
                            {password.length >= 12
                                ? "Strong"
                                : password.length >= 8
                                    ? "Medium"
                                    : "Weak"}
                        </span>
                    </div>

                    <div className="h-2 rounded-full bg-slate-200">
                        <div
                            className={`h-full rounded-full transition-all ${password.length >= 12
                                ? "w-full bg-green-500"
                                : password.length >= 8
                                    ? "w-2/3 bg-yellow-500"
                                    : password.length
                                        ? "w-1/3 bg-red-500"
                                        : "w-0"
                                }`}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-70"
                >
                    <Save size={18} />

                    {loading ? "Updating..." : "Update Password"}
                </button>
            </form>
        </div>
    );
}