import type { AxiosRequestConfig } from "axios";
import type { ApiResponse } from "@/shared/types/api-response";
import API from "./axios-instance";

export type ApiErrorFallback<T = unknown> = T | (() => T);

const getFallbackValue = <T>(fallback: ApiErrorFallback<T>): T => {
  return typeof fallback === "function" ? (fallback as () => T)() : fallback;
};

const getErrorData = <T>(
  error: unknown,
  fallback: ApiErrorFallback<ApiResponse<T> | null>,
): ApiResponse<T> | null => {
  const responseData = (error as { response?: { data?: ApiResponse<T> } }).response?.data;
  return responseData ?? getFallbackValue(fallback);
};

export const apiGet = async <T>(
  url: string,
  config?: AxiosRequestConfig,
  fallback: ApiErrorFallback<ApiResponse<T> | null> = null,
): Promise<ApiResponse<T> | null> => {
  try {
    const resp = await API.get<ApiResponse<T>>(url, config);
    return resp.data;
  } catch (error: unknown) {
    if ((error as { name?: string }).name === "CanceledError") return null;
    return getErrorData<T>(error, fallback);
  }
};

export const apiPost = async <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
  fallback: ApiErrorFallback<ApiResponse<T> | null> = null,
): Promise<ApiResponse<T> | null> => {
  try {
    const resp = await API.post<ApiResponse<T>>(url, data, config);
    return resp.data;
  } catch (error: unknown) {
    return getErrorData<T>(error, fallback);
  }
};

export const apiPut = async <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
  fallback: ApiErrorFallback<ApiResponse<T> | null> = null,
): Promise<ApiResponse<T> | null> => {
  try {
    const resp = await API.put<ApiResponse<T>>(url, data, config);
    return resp.data;
  } catch (error: unknown) {
    return getErrorData<T>(error, fallback);
  }
};

export const apiPatch = async <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
  fallback: ApiErrorFallback<ApiResponse<T> | null> = null,
): Promise<ApiResponse<T> | null> => {
  try {
    const resp = await API.patch<ApiResponse<T>>(url, data, config);
    return resp.data;
  } catch (error: unknown) {
    return getErrorData<T>(error, fallback);
  }
};

export const apiDelete = async <T>(
  url: string,
  config?: AxiosRequestConfig,
  fallback: ApiErrorFallback<ApiResponse<T> | null> = null,
): Promise<ApiResponse<T> | null> => {
  try {
    const resp = await API.delete<ApiResponse<T>>(url, config);
    return resp.data;
  } catch (error: unknown) {
    return getErrorData<T>(error, fallback);
  }
};
