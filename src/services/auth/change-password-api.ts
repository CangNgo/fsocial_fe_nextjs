import { apiPut } from "@/services/core/api-service";
import type { ApiResponse } from "@/shared/types/api-response";

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export async function changePassword(
  sendingData: ChangePasswordPayload,
): Promise<ApiResponse<null> | null> {
  return apiPut<null>("/account/change-password", sendingData);
}
