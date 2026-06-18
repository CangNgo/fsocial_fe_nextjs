import { apiPut } from "../apiService";

export interface UpdateProfile {
  firstName: string;
  lastName: string;
  bio: string;
  address: string;
  dob?: string;
}

export async function updateBanner(bannerFile: File): Promise<unknown> {
  const formData = new FormData();
  formData.append("file", bannerFile);
  return apiPut("/post/profile/update-background", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function updateAvatar(avatarFile: File): Promise<unknown> {
  const formData = new FormData();
  formData.append("file", avatarFile);
  return apiPut("/post/profile/update-avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function updatePersonalInfo(personalInfo: UpdateProfile): Promise<unknown> {
  return apiPut("/profile/update", personalInfo);
}
