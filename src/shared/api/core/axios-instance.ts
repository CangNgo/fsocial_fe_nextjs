import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getCookie, setCookie } from "@/shared/utils/cookie";

const PUBLIC_ENDPOINTS = ["/auth/login", "/auth/register", "/auth/send-otp", "/auth/valid-otp"];

export const API = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_DOMAIN}/${process.env.NEXT_PUBLIC_API_VERSION}`,
  withCredentials: true,
  timeout: 15000,
});

API.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const isPublic = PUBLIC_ENDPOINTS.some((url) => config.url?.includes(url));
  if (!isPublic) {
    const token = getCookie("access-token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

API.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(API(originalRequest));
          });
        });
      }

      isRefreshing = true;
      try {
        const refreshToken = getCookie("refresh-token");
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_DOMAIN}/auth/refresh-token`,
          { refreshToken },
        );

        const newToken: string = (data as { accessToken: string }).accessToken;
        setCookie("access-token", newToken, 1);

        refreshQueue.forEach((cb) => {
          cb(newToken);
        });
        refreshQueue = [];

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return API(originalRequest);
      } catch {
        refreshQueue = [];
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("auth:expired"));
        }
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default API;
