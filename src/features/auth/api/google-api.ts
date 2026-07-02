import { apiPost } from "@/shared/api/core/api-service";
import type { ApiResponse } from "@/shared/types/api-response";
import type { LoginResponse } from "../types/login";

export async function getUserInfoByGoogle(
  code: string,
): Promise<ApiResponse<LoginResponse> | null> {
  return apiPost<LoginResponse>("/auth/google/login", { code });
}
