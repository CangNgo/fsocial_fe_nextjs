import { create } from "zustand";
import { deleteCookie, getCookie } from "@/shared/utils/cookie";

interface ValidRefreshTokenStore {
  refreshToken: string | null;
  setRefreshToken: (token: string | null) => void;
}

export const validRefreshTokenStore = create<ValidRefreshTokenStore>()((set) => ({
  refreshToken: typeof window !== "undefined" ? getCookie("refresh-token") : null,

  setRefreshToken: (token) =>
    set(() => {
      if (!token) {
        deleteCookie("refresh-token");
        deleteCookie("access-token");
      }
      return { refreshToken: token };
    }),
}));

export const useValidRefreshTokenStore = validRefreshTokenStore;
