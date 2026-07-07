import { apiPost } from "@/services/core/api-service";
import type { ApiResponse } from "@/shared/types/api-response";
import type { LoginResponse } from "@/shared/types/auth";

export async function getUserInfoByGoogle(
  code: string,
): Promise<ApiResponse<LoginResponse> | null> {
  return apiPost<LoginResponse>("/auth/google/login", { code });
}
