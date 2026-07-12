"use client";

import axios from "axios";
import { RotateCcw, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import OTPInput from "@/components/auth/OTPInput";

import {
    ResendOTP,
    VerifyOTP,
    getBackendMessage,
} from "@/services/auth";

export default function VerifyOTPForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const contact = searchParams.get("email_or_phone") ?? searchParams.get("email") ?? "";
    const source = searchParams.get("source") ?? "forgot-password";

    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [seconds, setSeconds] = useState(10);

    useEffect(() => {
        if (seconds === 0) return;

        const timer = setTimeout(() => {
            setSeconds((prev) => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [seconds]);

    const handleVerify = async () => {
        if (otp.length !== 6) {
            toast.error("Please enter a valid OTP.");
            return;
        }

        try {
            setLoading(true);

            const response = await VerifyOTP({ email_or_phone: contact, otp, type: source as "register" | "forgot-password" });

            toast.success(
                getBackendMessage(response, "OTP verified.")
            );

            if (source === "register") {
                router.push("/auth/login");
                return;
            }
            const reset_token = response?.reset_token;
            router.push(
                `/auth/reset-password?email_or_phone=${encodeURIComponent(contact)}&reset_token=${encodeURIComponent(reset_token)}`
            );
        } catch (error) {
            console.error(error);

            toast.error(
                axios.isAxiosError(error)
                    ? getBackendMessage(
                        error.response?.data,
                        "Invalid OTP."
                    )
                    : "Invalid OTP."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            const response = await ResendOTP({
                email_or_phone: contact,
                type: source as "register" | "forgot-password",
            });

            toast.success(
                getBackendMessage(response, "OTP sent again.")
            );

            setSeconds(10);
        } catch (error) {
            console.error(error);

            toast.error(
                axios.isAxiosError(error)
                    ? getBackendMessage(
                        error.response?.data,
                        "Unable to resend OTP."
                    )
                    : "Unable to resend OTP."
            );
        }
    };

    return (
        <div className="space-y-8">
            <div className="rounded-xl bg-blue-50 p-4 text-center">
                <p className="text-sm text-slate-600">Verification code sent to</p>

                <p className="mt-1 break-all font-semibold text-blue-700">
                    {contact}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                    {source === "register"
                        ? "Verify your contact to activate your account."
                        : "Verify your contact to reset your password."}
                </p>
            </div>

            <OTPInput value={otp} onChange={setOtp} />

            <button
                onClick={handleVerify}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-70"
            >
                <ShieldCheck size={18} />

                {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <div className="text-center">
                {seconds > 0 ? (
                    <p className="text-sm text-slate-500">
                        Resend OTP in{" "}
                        <span className="font-semibold text-blue-600">{seconds}s</span>
                    </p>
                ) : (
                    <button
                        onClick={handleResend}
                        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                        <RotateCcw size={16} />

                        Resend OTP
                    </button>
                )}
            </div>
        </div>
    );
}