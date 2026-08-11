import { apiPost } from "@/services/core/api-service";
import type { ApiResponse } from "@/shared/types/api-response";
import { CreateAccountPayload, SendOtp, SignupDuplicateData, VerifyOtp } from "./sign-up";

export const checkDuplicate = async (
  data: SignupDuplicateData
): Promise<ApiResponse<SignupDuplicateData> | null> => {
  return apiPost<SignupDuplicateData>("/auth/check-duplication", data);
};

export const requestOTP = async (data: SendOtp): Promise<ApiResponse<null> | null> => {
  return apiPost<null>("/auth/send-otp", data);
};

export const validOTP = async (data: VerifyOtp): Promise<ApiResponse<null> | null> => {
  return apiPost<null>("/auth/verify-otp", data);
};

export const sendingCreateAccount = async (
  data: CreateAccountPayload,
): Promise<ApiResponse<null> | null> => {
  return apiPost<null>("/auth/register", data);
};
