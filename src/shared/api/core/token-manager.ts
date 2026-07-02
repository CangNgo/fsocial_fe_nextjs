import { validRefreshTokenStore } from "@/shared/stores/valid-refresh-token-store";
import { getCookie, setCookie } from "@/shared/utils/cookie";
import { apiPost } from "./api-service";

export const refreshToken = async (): Promise<unknown> => {
  const setRefreshToken = validRefreshTokenStore.getState().setRefreshToken;
  try {
    const token = getCookie("refresh-token");
    const data = await apiPost<{ accessToken: string }>("/auth/refresh-token", {
      refreshToken: token,
    });
    if (data?.data?.accessToken) {
      setCookie("access-token", data.data.accessToken, 360 * 10);
    }
    return data;
  } catch (error: unknown) {
    setRefreshToken(null);
    return (error as { response?: { data: unknown } }).response?.data ?? null;
  }
};
