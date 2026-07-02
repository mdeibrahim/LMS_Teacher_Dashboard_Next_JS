import { Suspense } from "react";

import VerifyOTPForm from "@/components/auth/VerifyOTPForm";

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div className="space-y-8" />}>
      <VerifyOTPForm />
    </Suspense>
  );
}