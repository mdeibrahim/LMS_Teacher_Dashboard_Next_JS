import api from "../api";
import type {
  AdminCertificate,
  AdminDeviceSession,
  AdminEnrollment,
  AdminOTP,
  AdminPaymentInstruction,
  AdminPaymentSubmission,
  AdminStudent,
  AdminTeacher,
  PaginatedResponse,
  PaymentInstructionCreateData,
  PaymentInstructionUpdateData,
  PaymentSubmissionUpdateData,
  User,
  UserCreateData,
  UserUpdateData,
} from "./types";

type PaginationParams = {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: number | string | boolean | undefined;
};

function buildQueryString(params: PaginationParams): string {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);

  Object.entries(params).forEach(([key, value]) => {
    if (key !== "page" && key !== "limit" && key !== "search" && value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });

  const str = query.toString();
  return str ? `?${str}` : "";
}

export const getUsers = async (params: PaginationParams = {}): Promise<PaginatedResponse<User>> => {
  const response = await api.get(`/admin/users/${buildQueryString(params)}`);
  return response.data;
};

export const getUser = async (id: number): Promise<{ message: string; data: User }> => {
  const response = await api.get(`/admin/users/${id}/`);
  return response.data;
};

export const createUser = async (data: UserCreateData): Promise<{ message: string; data: User }> => {
  const response = await api.post("/admin/users/", data);
  return response.data;
};

export const updateUser = async (id: number, data: UserUpdateData): Promise<{ message: string; data: User }> => {
  const response = await api.patch(`/admin/users/${id}/`, data);
  return response.data;
};

export const deleteUser = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete(`/admin/users/${id}/`);
  return response.data;
};

export const getTeachers = async (): Promise<{ message: string; data: AdminTeacher[] }> => {
  const response = await api.get("/admin/teachers/");
  return response.data;
};

export const getStudents = async (): Promise<{ message: string; data: AdminStudent[] }> => {
  const response = await api.get("/admin/students/");
  return response.data;
};

export const getDeviceSessions = async (params: PaginationParams = {}): Promise<PaginatedResponse<AdminDeviceSession>> => {
  const response = await api.get(`/admin/device-sessions/${buildQueryString(params)}`);
  return response.data;
};

export const getOTPs = async (params: PaginationParams = {}): Promise<PaginatedResponse<AdminOTP>> => {
  const response = await api.get(`/admin/otps/${buildQueryString(params)}`);
  return response.data;
};

export const getPaymentSubmissions = async (params: PaginationParams = {}): Promise<PaginatedResponse<AdminPaymentSubmission>> => {
  const response = await api.get(`/admin/payment-submissions/${buildQueryString(params)}`);
  return response.data;
};

export const updatePaymentSubmission = async (id: number, data: PaymentSubmissionUpdateData): Promise<{ message: string; data: AdminPaymentSubmission }> => {
  const response = await api.patch(`/admin/payment-submissions/${id}/`, data);
  return response.data;
};

export const getEnrollments = async (): Promise<{ message: string; data: AdminEnrollment[] }> => {
  const response = await api.get("/admin/enrollments/");
  return response.data;
};

export const getCertificates = async (): Promise<{ message: string; data: AdminCertificate[] }> => {
  const response = await api.get("/admin/certificates/");
  return response.data;
};

export const getPaymentInstructions = async (): Promise<{ message: string; data: AdminPaymentInstruction[] }> => {
  const response = await api.get("/admin/payment-instructions/");
  return response.data;
};

export const createPaymentInstruction = async (data: PaymentInstructionCreateData): Promise<{ message: string; data: AdminPaymentInstruction }> => {
  const form = new FormData();
  form.set("payment_method_name", data.payment_method_name);
  form.set("details", data.details);
  if (data.image) {
    form.set("image", data.image);
  }

  const response = await api.post("/admin/payment-instructions/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updatePaymentInstruction = async (id: number, data: PaymentInstructionUpdateData): Promise<{ message: string; data: AdminPaymentInstruction }> => {
  const form = new FormData();
  if (data.payment_method_name) form.set("payment_method_name", data.payment_method_name);
  if (data.details) form.set("details", data.details);
  if (data.image) {
    form.set("image", data.image);
  }

  const response = await api.patch(`/admin/payment-instructions/${id}/`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deletePaymentInstruction = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete(`/admin/payment-instructions/${id}/`);
  return response.data;
};
