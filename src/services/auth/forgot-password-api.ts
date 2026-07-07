import { apiPost, apiPut } from "@/services/core/api-service";
import type { ApiResponse } from "@/shared/types/api-response";

export interface RequestOtpPayload {
  email: string;
  type: "RESET";
}

export interface ValidOtpPayload {
  email: string;
  otp: string;
  type: "RESET";
}

export interface ResetPasswordPayload {
  email: string;
  newPassword: string;
}

export const requestOTP = async (data: RequestOtpPayload): Promise<ApiResponse<null> | null> => {
  return apiPost<null>("/auth/send-otp", data, undefined, {});
};

export const validOTP = async (data: ValidOtpPayload): Promise<ApiResponse<null> | null> => {
  return apiPost<null>("/auth/verify-otp", data);
};

export const resetPassword = async (
  data: ResetPasswordPayload,
): Promise<ApiResponse<null> | null> => {
  return apiPut<null>("/auth/reset-password", data, undefined, {});
};
