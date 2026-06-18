import { apiPut } from "../apiService";

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export async function changePassword(sendingData: ChangePasswordPayload): Promise<unknown> {
  return apiPut("/post/change-password", sendingData);
}
