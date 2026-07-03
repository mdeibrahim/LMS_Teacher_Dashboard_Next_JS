import api from "./api";

type BackendMessagePayload = {
  message?: string;
  detail?: string | string[];
  error?: string | string[];
  non_field_errors?: string[];
  email?: string[];
  password?: string[];
  otp?: string[];
};

export const getBackendMessage = (
  data: unknown,
  fallback: string
) => {
  if (!data || typeof data !== "object") {
    return fallback;
  }

  const payload = data as BackendMessagePayload;

  const candidates = [
    payload.message,
    Array.isArray(payload.detail) ? payload.detail[0] : payload.detail,
    Array.isArray(payload.error) ? payload.error[0] : payload.error,
    payload.non_field_errors?.[0],
    payload.email?.[0],
    payload.password?.[0],
    payload.otp?.[0],
  ].filter(Boolean);

  return candidates[0] || fallback;
};

const buildAuthFormData = <T extends object>(data: T) => {
  const formData = new FormData();

  for (const [key, value] of Object.entries(
    data as Record<string, string>
  )) {
    formData.append(key, value);
  }

  return formData;
};

/* ===========================
   Register
=========================== */

export interface RegisterPayload {
  email: string;
  password: string;
  confirm_password: string;
  full_name: string;
  phone_number: string;
}

export const RegisterTeacher = async (
  data: RegisterPayload
) => {
  const response = await api.post(
    "/auth/register/",
    buildAuthFormData(data),
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

/* ===========================
   Login
=========================== */

export interface LoginPayload {
  email: string;
  password: string;
}

export const LoginTeacher = async (
  data: LoginPayload
) => {
  const response = await api.post(
    "/auth/login/",
    buildAuthFormData(data),
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

/* ===========================
   Forgot Password
=========================== */

export interface ForgotPasswordPayload {
  email: string;
}

export const ForgotPassword = async (
  data: ForgotPasswordPayload
) => {
  const response = await api.post(
    "/auth/forgot-password/",
    data
  );

  return response.data;
};

/* ===========================
   Verify OTP
=========================== */

export interface VerifyOTPPayload {
  email: string;
  otp: string;
  type: "register" | "forgot-password";
  reset_token?: string;
}

export const VerifyOTP = async (
  data: VerifyOTPPayload
) => {
  const response = await api.post(
    "/auth/verify-otp/",
    data
  );

  return response.data;
};

/* ===========================
   Resend OTP
=========================== */

export interface ResendOTPPayload {
  email: string;
  type: "register" | "forgot-password";
}

export const ResendOTP = async (
  data: ResendOTPPayload
) => {
  const response = await api.post(
    "/auth/resend-otp/",
    data
  );

  return response.data;
};

/* ===========================
   Reset Password
=========================== */

export interface ResetPasswordPayload {
  email: string;
  reset_token: string;
  password: string;
  confirm_password: string;
}

export const ResetPassword = async (
  data: ResetPasswordPayload
) => {
  const response = await api.post(
    "/auth/reset-password/",
    data
  );

  return response.data;
};