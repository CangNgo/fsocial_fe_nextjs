import { apiGet, apiPost, apiPut } from "@/services/core/api-service";
import type { ApiResponse } from "@/shared/types/api-response";
import type { ComplaintItem } from "@/shared/types/admin";

export interface CreateComplaintPayload {
  postId: string;
  userId?: string;
  complaintType: string;
  termOfServiceId: string;
}

export const complaint = async (
  complaintData: CreateComplaintPayload,
): Promise<ApiResponse<null> | null> => {
  return apiPost<null>("/complaint", complaintData);
};

export const getComplaint = async (): Promise<ApiResponse<ComplaintItem[]> | null> => {
  return apiGet<ComplaintItem[]>("/complaint");
};

export const readingComplaint = async (id: string): Promise<ApiResponse<null> | null> => {
  return apiPut<null>(`/complaint/reading?complaint_id=${id}`);
};
