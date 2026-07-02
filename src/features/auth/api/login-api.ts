import { apiPost } from "@/shared/api/core/api-service";
import type { ApiResponse } from "@/shared/types/api-response";
import type { LoginPayload, LoginResponse } from "../types/login";

export const login = async (data: LoginPayload): Promise<ApiResponse<LoginResponse> | null> => {
  return apiPost<LoginResponse>("post/auth/login", data);
};
