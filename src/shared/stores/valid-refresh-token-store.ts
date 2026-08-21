import { create } from "zustand";
import { deleteCookie, getCookie } from "@/shared/utils/cookie";

interface ValidRefreshTokenStore {
  refreshToken: string | null;
  isSessionExpired: boolean;
  setRefreshToken: (token: string | null) => void;
  setSessionExpired: (expired: boolean) => void;
}

export const validRefreshTokenStore = create<ValidRefreshTokenStore>()((set) => ({
  refreshToken: typeof window !== "undefined" ? getCookie("refresh-token") : null,
  isSessionExpired: false,

  setRefreshToken: (token) =>
    set(() => {
      if (!token) {
        deleteCookie("refresh-token");
        deleteCookie("access-token");
        return { refreshToken: token };
      }
      return { refreshToken: token, isSessionExpired: false };
    }),

  setSessionExpired: (expired) => set({ isSessionExpired: expired }),
}));

export const useValidRefreshTokenStore = validRefreshTokenStore;
