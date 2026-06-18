import { apiPost, apiPut } from "../apiService";

export const requestOTP = async (data: unknown): Promise<unknown> => {
  return apiPost("/post/auth/send-otp", data, undefined, {});
};

export const validOTP = async (data: unknown): Promise<unknown> => {
  return apiPost("/post/auth/verify-otp", data);
};

export const resetPassword = async (data: unknown): Promise<unknown> => {
  return apiPut("/post/auth/reset-password", data, undefined, {});
};
