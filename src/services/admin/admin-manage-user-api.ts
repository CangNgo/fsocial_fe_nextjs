import { apiGet, apiPost } from "@/services/core/api-service";
import type { ApiResponse } from "@/shared/types/api-response";
import type { ManageUserItem } from "@/shared/types/admin";

export const getManageUser = async (): Promise<ApiResponse<ManageUserItem[]> | null> => {
  return apiGet<ManageUserItem[]>("/account");
};

export const banUser = async (userId: string): Promise<ApiResponse<null> | null> => {
  return apiPost<null>(`/account/ban?user_id=${userId}`);
};
