import { apiGet } from "@/services/core/api-service";
import type { ApiResponse } from "@/shared/types/api-response";
import type { AccountResponse } from "@/shared/types/profile";

export const getAdminProfile = async (
  userId: string,
): Promise<ApiResponse<AccountResponse> | null> => {
  return apiGet<AccountResponse>(`/profile/profile-admin/${userId}`);
};
