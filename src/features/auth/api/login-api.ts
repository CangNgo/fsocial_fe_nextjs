import { apiPost } from "@/shared/api/core/api-service";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  statusCode?: number;
  message?: string;
  data?: {
    accessToken: string;
    refreshToken: string;
  };
}

export const login = async (data: LoginPayload): Promise<LoginResponse | null> => {
  return apiPost<LoginResponse>("/post/auth/login", data);
};
