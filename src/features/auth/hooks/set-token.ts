import { validRefreshTokenStore } from "@/shared/stores/valid-refresh-token-store";
import { setCookie } from "@/shared/utils/cookie";

export function setToken(accessToken: string, refreshToken: string) {
  setCookie("access-token", accessToken, 1);
  setCookie("refresh-token", refreshToken, 10);
  validRefreshTokenStore.getState().setRefreshToken(refreshToken);
}
