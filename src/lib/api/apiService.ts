import type { AxiosRequestConfig } from "axios";
import API from "./axiosInstance";

export type ApiErrorFallback<T = unknown> = T | (() => T);

const getFallbackValue = <T>(fallback: ApiErrorFallback<T>): T => {
  return typeof fallback === "function" ? (fallback as () => T)() : fallback;
};

const getErrorData = <T>(error: unknown, fallback: ApiErrorFallback<T>): T => {
  return (error as { response?: { data?: T } }).response?.data ?? getFallbackValue(fallback);
};

export const apiGet = async <T>(
  url: string,
  config?: AxiosRequestConfig,
  fallback: ApiErrorFallback<T | null> = null,
): Promise<T | null> => {
  try {
    const resp = await API.get<T>(url, config);
    return resp.data;
  } catch (error: unknown) {
    if ((error as { name?: string }).name === "CanceledError") return null;
    return getErrorData(error, fallback);
  }
};

export const apiPost = async <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
  fallback: ApiErrorFallback<T | null> = null,
): Promise<T | null> => {
  try {
    const resp = await API.post<T>(url, data, config);
    return resp.data;
  } catch (error: unknown) {
    return getErrorData(error, fallback);
  }
};

export const apiPut = async <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
  fallback: ApiErrorFallback<T | null> = null,
): Promise<T | null> => {
  try {
    const resp = await API.put<T>(url, data, config);
    return resp.data;
  } catch (error: unknown) {
    return getErrorData(error, fallback);
  }
};

export const apiPatch = async <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
  fallback: ApiErrorFallback<T | null> = null,
): Promise<T | null> => {
  try {
    const resp = await API.patch<T>(url, data, config);
    return resp.data;
  } catch (error: unknown) {
    return getErrorData(error, fallback);
  }
};

export const apiDelete = async <T>(
  url: string,
  config?: AxiosRequestConfig,
  fallback: ApiErrorFallback<T | null> = null,
): Promise<T | null> => {
  try {
    const resp = await API.delete<T>(url, config);
    return resp.data;
  } catch (error: unknown) {
    return getErrorData(error, fallback);
  }
};
