import { apiPut } from "@/shared/api/core/api-service";

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export async function changePassword(sendingData: ChangePasswordPayload): Promise<unknown> {
  return apiPut("/post/change-password", sendingData);
}
