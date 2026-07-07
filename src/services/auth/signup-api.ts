import { apiPost } from "@/services/core/api-service";
import type { ApiResponse } from "@/shared/types/api-response";

export interface SignupDuplicateData {
  username?: string;
  email?: string;
}

export interface CreateAccountPayload {
  firstName: string;
  lastName: string;
  day: string;
  month: string;
  year: string;
  gender: string;
  username: string;
  email: string;
  password: string;
  rePassword: string;
}

export const checkDuplicate = async (
  username: string,
): Promise<ApiResponse<SignupDuplicateData> | null> => {
  return apiPost<SignupDuplicateData>("/auth/check-duplication", username);
};

export const requestOTP = async (email: string): Promise<ApiResponse<null> | null> => {
  return apiPost<null>("/auth/send-otp", email, undefined, {});
};

export const validOTP = async (otp: string): Promise<ApiResponse<null> | null> => {
  return apiPost<null>("/auth/verify-otp", otp, undefined, {});
};

export const sendingCreateAccount = async (
  data: CreateAccountPayload,
): Promise<ApiResponse<null> | null> => {
  return apiPost<null>("/auth/register", data, undefined, {});
};
