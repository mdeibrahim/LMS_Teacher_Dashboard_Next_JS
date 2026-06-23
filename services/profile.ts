import api from "./api";

export interface Profile {
  id: number;
  email: string;
  full_name: string;
  phone_number: string;
  profile_picture: string | null;
  teacher_institution: string | null;
  teacher_subject: string | null;
  teacher_experience_years: number | null;
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
