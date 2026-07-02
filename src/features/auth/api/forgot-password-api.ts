import { apiPost, apiPut } from "@/shared/api/core/api-service";

export const requestOTP = async (data: unknown): Promise<unknown> => {
  return apiPost("/auth/send-otp", data, undefined, {});
};

export const validOTP = async (data: unknown): Promise<unknown> => {
  return apiPost("/auth/verify-otp", data);
};

export const resetPassword = async (data: unknown): Promise<unknown> => {
  return apiPut("/auth/reset-password", data, undefined, {});
};
