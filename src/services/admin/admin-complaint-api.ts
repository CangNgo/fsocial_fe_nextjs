import { apiGet, apiPost, apiPut } from "@/services/core/api-service";
import type { ApiResponse } from "@/shared/types/api-response";
import type { ComplaintItem } from "@/shared/types/admin";

export const getComplaint = async (): Promise<ApiResponse<ComplaintItem[]> | null> => {
  return apiGet<ComplaintItem[]>("/complaint");
};

export const getPostComplaint = async (): Promise<ApiResponse<ComplaintItem[]> | null> => {
  return apiGet<ComplaintItem[]>("/complaint/post");
};

export const getUserComplaint = async (): Promise<ApiResponse<ComplaintItem[]> | null> => {
  return apiGet<ComplaintItem[]>("/complaint/user");
};

export const postComplaint = async (
  userId: string,
  postId: string,
): Promise<ApiResponse<null> | null> => {
  return apiPost<null>("/complaint", { userId, postId });
};

export const readingComplaint = async (id: string): Promise<ApiResponse<null> | null> => {
  return apiPut<null>(`/complaint/reading?complaint_id=${id}`);
};

export const searchComplaint = async (
  keyword: string,
): Promise<ApiResponse<ComplaintItem[]> | null> => {
  return apiGet<ComplaintItem[]>(`/complaint/find?find_name=${keyword}`);
};
