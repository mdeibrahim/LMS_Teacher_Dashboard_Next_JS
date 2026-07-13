export interface PaginatedResponse<T> {
  message: string;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone_number: string;
  role: string;
  is_active: boolean;
  is_staff: boolean;
  is_verified: boolean;
  date_joined: string;
}

export interface UserCreateData {
  email: string;
  password: string;
  full_name: string;
  phone_number: string;
  role: string;
  is_staff: boolean;
  is_active: boolean;
}

export interface UserUpdateData {
  email?: string;
  full_name?: string;
  phone_number?: string;
  role?: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_verified?: boolean;
}

export interface NestedUser {
  id: number;
  email: string;
  full_name: string;
}

export interface AdminTeacher {
  id: number;
  user: NestedUser;
  profile_picture: string | null;
  full_name: string;
  phone_number: string;
  address: string;
  bio: string;
  teacher_institution: string;
  teacher_subject: string;
  teacher_experience_years: number | null;
  created_at: string;
}

export interface AdminStudent {
  id: number;
  user: NestedUser;
  profile_picture: string | null;
  full_name: string;
  phone_number: string;
  student_institution: string;
  student_level: string;
  created_at: string;
}

export interface AdminDeviceSession {
  id: number;
  user: NestedUser;
  jti: string;
  user_agent: string;
  ip_address: string | null;
  created_at: string;
  last_seen: string;
  expires_at: string;
}

export interface AdminOTP {
  id: number;
  user: NestedUser;
  code: string;
  channel: string;
  is_used: boolean;
  created_at: string;
  expires_at: string;
}

export interface AdminPaymentSubmission {
  id: number;
  user: NestedUser;
  course: { id: number; name: string };
  payment_method: string;
  transaction_id: string;
  bkash_phone_number: string;
  note: string;
  status: string;
  reviewed_by: NestedUser | null;
  reviewed_at: string | null;
  rejection_reason: string;
  submitted_at: string;
  updated_at: string;
}

export interface AdminEnrollment {
  id: number;
  user: NestedUser;
  course: { id: number; name: string; slug: string };
  status: string;
  granted_by: NestedUser | null;
  granted_at: string;
  updated_at: string;
}

export interface AdminCertificate {
  id: number;
  user: NestedUser;
  course: { id: number; name: string };
  certificate_code: string;
  issued_at: string;
}

export interface AdminPaymentInstruction {
  id: number;
  payment_method_name: string;
  details: string;
  image: string | null;
  created_at: string;
}

export interface PaymentInstructionCreateData {
  payment_method_name: string;
  details: string;
  image?: File | null;
}

export interface PaymentInstructionUpdateData {
  payment_method_name?: string;
  details?: string;
  image?: File | null;
}

export interface PaymentSubmissionUpdateData {
  status?: string;
  rejection_reason?: string;
}
