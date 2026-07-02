import { apiPut } from "@/shared/api/core/api-service";

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export async function changePassword(sendingData: ChangePasswordPayload): Promise<unknown> {
  return apiPut("/change-password", sendingData);
}
