import type { ApiResponse } from "@/shared/types/api-response";
import type { FaqPayload, FaqResponse, FaqType } from "@/shared/types/faq";
import { apiDelete, apiGet, apiPost, apiPut } from "../core/api-service";

const FAQ_ENDPOINT = "/faq";

export const getFaqs = async (): Promise<ApiResponse<FaqResponse[]> | null> => {
  return apiGet<FaqResponse[]>(FAQ_ENDPOINT);
};

export const getFaqsByType = async (
  type: FaqType,
): Promise<ApiResponse<FaqResponse[]> | null> => {
  return apiGet<FaqResponse[]>(`${FAQ_ENDPOINT}/type/${type}`);
};

export const getFaqById = async (faqId: string): Promise<ApiResponse<FaqResponse> | null> => {
  return apiGet<FaqResponse>(`${FAQ_ENDPOINT}/${faqId}`);
};

export const createFaq = async (payload: FaqPayload): Promise<ApiResponse<FaqResponse> | null> => {
  return apiPost<FaqResponse>(FAQ_ENDPOINT, payload);
};

export const updateFaq = async (
  faqId: string,
  payload: FaqPayload,
): Promise<ApiResponse<FaqResponse> | null> => {
  return apiPut<FaqResponse>(`${FAQ_ENDPOINT}/${faqId}`, payload);
};

export const deleteFaq = async (faqId: string): Promise<ApiResponse<null> | null> => {
  return apiDelete<null>(`${FAQ_ENDPOINT}/${faqId}`);
};
