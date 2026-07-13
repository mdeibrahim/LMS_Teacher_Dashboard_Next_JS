import api from "./api";

export interface Profile {
  id: number;
  email: string;
  full_name: string;
  phone_number: string;
  address: string | null;
  bio: string | null;
  profile_picture: string | null;
  teacher_institution: string | null;
  teacher_subject: string | null;
  teacher_experience_years: number | null;
  is_admin: boolean;
  created_at: string;
}

interface ProfileResponse {
  message: string;
  data: Profile;
}

export const getProfile = async (): Promise<Profile> => {
  const response = await api.get("/profile/");
  const payload = response.data as ProfileResponse | Profile;

  if ("data" in payload && payload.data) {
    return payload.data;
  }

  return payload as Profile;
};

export const updateProfile = async (data: Partial<Profile>) => {
  const response = await api.put("/profile/", data);
  return response.data;
}


export interface PasswordChange {
  current_password: string;
  new_password: string;
  confirm_password: string;
}
 
interface PasswordChangeResponse {
  message: string;
}

export const passwordChange = async (
  data: PasswordChange
): Promise<PasswordChangeResponse> => {
  const response = await api.post("/change-password/", data);

  return response.data;
}