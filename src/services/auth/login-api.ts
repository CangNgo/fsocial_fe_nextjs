import { apiPost } from "@/services/core/api-service";
import type { ApiResponse } from "@/shared/types/api-response";
import type { LoginPayload, LoginResponse } from "@/shared/types/auth";

export const login = async (data: LoginPayload): Promise<ApiResponse<LoginResponse> | null> => {
  return apiPost<LoginResponse>("/auth/login", data);
};
