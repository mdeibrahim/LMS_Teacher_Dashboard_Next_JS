import { Suspense } from "react";

import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-4" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}