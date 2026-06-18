import { apiPost } from "../apiService";

export const checkDuplicate = async (data: unknown): Promise<unknown> => {
  return apiPost("/post/auth/check-duplication", data);
};

export const requestOTP = async (data: unknown): Promise<unknown> => {
  return apiPost("/post/auth/send-otp", data, undefined, {});
};

export const validOTP = async (data: unknown): Promise<unknown> => {
  return apiPost("/post/auth/verify-otp", data, undefined, {});
};

export const sendingCreateAccount = async (data: unknown): Promise<unknown> => {
  return apiPost("/post/auth/register", data, undefined, {});
};
