import { apiPut } from "@/services/core/api-service";
import type { ApiResponse } from "@/shared/types/api-response";
import type { AccountResponse } from "@/shared/types/profile";

export interface UpdateProfile {
  firstName: string;
  lastName: string;
  bio?: string;
  address: string;
  dob?: string;
  gender?: number;
}

export interface ProfileUpdateResponse {
  id?: string;
  avatar?: string | null;
  bio?: string;
  background?: string | null;
  displayName?: string;
  gender?: number;
}

export async function updateBanner(
  bannerFile: File,
): Promise<ApiResponse<ProfileUpdateResponse> | null> {
  const formData = new FormData();
  formData.append("file", bannerFile);
  return apiPut<ProfileUpdateResponse>("/profile/update-background", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function updateAvatar(
  avatarFile: File,
): Promise<ApiResponse<ProfileUpdateResponse> | null> {
  const formData = new FormData();
  formData.append("file", avatarFile);
  return apiPut<ProfileUpdateResponse>("/profile/update-avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function updatePersonalInfo(
  personalInfo: UpdateProfile,
): Promise<ApiResponse<AccountResponse> | null> {
  return apiPut<AccountResponse>("/profile/update", personalInfo);
}
