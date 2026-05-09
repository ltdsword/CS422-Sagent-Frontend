import axiosInstance from "@/shared/utils/axios-instance";

export type ProfileResponse = {
  full_name?: string;
  name?: string;
  username?: string;
  email?: string;
};

export async function getProfile(): Promise<ProfileResponse> {
  const { data } = await axiosInstance.get<ProfileResponse>("/auth/profile/");
  return data;
}

export async function updateProfile(body: Partial<ProfileResponse>): Promise<ProfileResponse> {
  const { data } = await axiosInstance.patch<ProfileResponse>("/auth/profile/", body);
  return data;
}

export async function changePassword(body: {
  old_password: string;
  new_password: string;
}): Promise<void> {
  await axiosInstance.post("/auth/change-password/", body);
}

