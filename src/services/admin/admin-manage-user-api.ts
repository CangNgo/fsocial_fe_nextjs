import { apiGet, apiPost } from "@/services/core/api-service";
import type { ApiResponse } from "@/shared/types/api-response";
import type { ManageUserItem } from "@/shared/types/admin";

export const getManageUser = async (): Promise<ApiResponse<ManageUserItem[]> | null> => {
  return apiGet<ManageUserItem[]>("/manageUser");
};

export const banUser = async (userId: string): Promise<ApiResponse<null> | null> => {
  return apiPost<null>(`/banUser/${userId}`);
};

export const getUser = async (): Promise<ApiResponse<ManageUserItem[]> | null> => {
  return apiGet<ManageUserItem[]>("/getUser");
};

export const postManageUser = async (userID: string): Promise<ApiResponse<null> | null> => {
  return apiPost<null>(`/manageUser/userID=${userID}`);
};

export const searchManageUser = async (
  keyword: string,
): Promise<ApiResponse<ManageUserItem[]> | null> => {
  return apiGet<ManageUserItem[]>(`/manageUser/find?find_name=${keyword}`);
};
