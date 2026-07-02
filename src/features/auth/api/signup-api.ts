import { apiPost } from "@/shared/api/core/api-service";

export const checkDuplicate = async (data: unknown): Promise<unknown> => {
  return apiPost("/auth/check-duplication", data);
};

export const requestOTP = async (data: unknown): Promise<unknown> => {
  return apiPost("/auth/send-otp", data, undefined, {});
};

export const validOTP = async (data: unknown): Promise<unknown> => {
  return apiPost("/auth/verify-otp", data, undefined, {});
};

export const sendingCreateAccount = async (data: unknown): Promise<unknown> => {
  return apiPost("/auth/register", data, undefined, {});
};
