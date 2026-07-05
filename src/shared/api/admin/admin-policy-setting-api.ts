import type { TermOfServiceResponse } from "@/features/profile/types/term_of_service";
import type { ApiResponse } from "@/shared/types/api-response";
import { apiDelete, apiGet, apiPost } from "../core/api-service";

export const getPolicies = async (): Promise<unknown> => {
  return apiGet("/policy");
};

export const postPolicies = async (
  listPolicy: unknown,
): Promise<ApiResponse<TermOfServiceResponse[]> | null> => {
  return apiPost<TermOfServiceResponse[]>("/policy", listPolicy);
};

export const getTermOfService = async (): Promise<ApiResponse<TermOfServiceResponse[]> | null> => {
  return apiGet<TermOfServiceResponse[]>("/term_of_service");
};

export const removeTermOfService = async (id: string): Promise<ApiResponse<null> | null> => {
  return apiDelete<null>(`/term_of_service?term_id=${id}`);
};

export const addTermOfService = async (
  name: string,
): Promise<ApiResponse<TermOfServiceResponse> | null> => {
  return apiPost<TermOfServiceResponse>("/term_of_service", { name });
};
